import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Megaphone, Heart, ThumbsUp, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, type Announcement, type AnnouncementReaction } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export const AnnouncementBanner: React.FC = () => {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [reactionCounts, setReactionCounts] = useState<Record<string, { heart: number, thumbs_up: number }>>({})
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements.length > 1 && isAutoScrolling) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [announcements.length, isAutoScrolling])

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select(`
        *,
        event:events(id, title, slug),
        artist:artists(id, name, slug),
        venue:venues(id, name, slug)
      `)
      .eq('active', true)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      setAnnouncements(data)
      fetchReactionCounts(data.map(a => a.id))
      if (user) {
        fetchUserReactions(data.map(a => a.id))
      }
    }
  }

  const fetchReactionCounts = async (announcementIds: string[]) => {
    if (announcementIds.length === 0) return

    const { data } = await supabase
      .from('announcement_reactions')
      .select('announcement_id, reaction_type')
      .in('announcement_id', announcementIds)

    const counts: Record<string, { heart: number, thumbs_up: number }> = {}
    announcementIds.forEach(id => {
      counts[id] = { heart: 0, thumbs_up: 0 }
    })

    data?.forEach(reaction => {
      if (counts[reaction.announcement_id]) {
        counts[reaction.announcement_id][reaction.reaction_type as 'heart' | 'thumbs_up']++
      }
    })

    setReactionCounts(counts)
  }

  const fetchUserReactions = async (announcementIds: string[]) => {
    if (!user || announcementIds.length === 0) return

    const { data } = await supabase
      .from('announcement_reactions')
      .select('announcement_id, reaction_type')
      .eq('user_id', user.id)
      .in('announcement_id', announcementIds)

    const reactions: Record<string, string[]> = {}
    data?.forEach(reaction => {
      if (!reactions[reaction.announcement_id]) {
        reactions[reaction.announcement_id] = []
      }
      reactions[reaction.announcement_id].push(reaction.reaction_type)
    })

    setUserReactions(reactions)
  }

  const handleReaction = async (announcementId: string, reactionType: 'heart' | 'thumbs_up') => {
    if (!user) return

    const userHasReaction = userReactions[announcementId]?.includes(reactionType)

    if (userHasReaction) {
      // Remove reaction
      await supabase
        .from('announcement_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('announcement_id', announcementId)
        .eq('reaction_type', reactionType)
    } else {
      // Add reaction
      await supabase
        .from('announcement_reactions')
        .insert({
          user_id: user.id,
          announcement_id: announcementId,
          reaction_type: reactionType
        })
    }

    // Refresh data
    fetchReactionCounts([announcementId])
    fetchUserReactions([announcementId])
  }

  const nextAnnouncement = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const prevAnnouncement = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  if (!isVisible || announcements.length === 0) {
    return null
  }

  const currentAnnouncement = announcements[currentIndex]
  const currentReactions = reactionCounts[currentAnnouncement?.id] || { heart: 0, thumbs_up: 0 }
  const currentUserReactions = userReactions[currentAnnouncement?.id] || []

  const getEntityLink = (announcement: Announcement) => {
    if (announcement.entity_type === 'event' && announcement.event) {
      return `/events/${announcement.event.slug}`
    }
    if (announcement.entity_type === 'artist' && announcement.artist) {
      return `/artists/${announcement.artist.slug}`
    }
    if (announcement.entity_type === 'venue' && announcement.venue) {
      return `/venues/${announcement.venue.slug}`
    }
    return null
  }

  const getEntityName = (announcement: Announcement) => {
    if (announcement.entity_type === 'event' && announcement.event) {
      return announcement.event.title
    }
    if (announcement.entity_type === 'artist' && announcement.artist) {
      return announcement.artist.name
    }
    if (announcement.entity_type === 'venue' && announcement.venue) {
      return announcement.venue.name
    }
    return null
  }

  return (
    <div className="bg-gradient-to-r from-[#C80650] to-purple-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="hidden sm:block">
              <Megaphone size={20} className="text-white/80" />
            </div>
            
            <div className="flex items-center space-x-2">
              {announcements.length > 1 && (
                <button
                  onClick={prevAnnouncement}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  onMouseEnter={() => setIsAutoScrolling(false)}
                  onMouseLeave={() => setIsAutoScrolling(true)}
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              
              {announcements.length > 1 && (
                <button
                  onClick={nextAnnouncement}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  onMouseEnter={() => setIsAutoScrolling(false)}
                  onMouseLeave={() => setIsAutoScrolling(true)}
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-center mb-3">
            <h3 className="font-semibold text-lg mb-2">
              {currentAnnouncement.title}
            </h3>
            <p className="text-sm opacity-90 mb-3">
              {currentAnnouncement.content}
            </p>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-3">
              {currentAnnouncement.learnmore_link && (
                <a
                  href={currentAnnouncement.learnmore_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#FFCE03] text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                >
                  <span>Learn More</span>
                  <ExternalLink size={14} />
                </a>
              )}
              
              {getEntityLink(currentAnnouncement) && (
                <Link
                  to={getEntityLink(currentAnnouncement)!}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
                >
                  View {getEntityName(currentAnnouncement)}
                </Link>
              )}
            </div>
            
            {/* Reactions */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleReaction(currentAnnouncement.id, 'heart')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                  currentUserReactions.includes('heart')
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart size={14} fill={currentUserReactions.includes('heart') ? 'currentColor' : 'none'} />
                <span className="text-sm">{currentReactions.heart}</span>
              </button>
              
              <button
                onClick={() => handleReaction(currentAnnouncement.id, 'thumbs_up')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                  currentUserReactions.includes('thumbs_up')
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <ThumbsUp size={14} fill={currentUserReactions.includes('thumbs_up') ? 'currentColor' : 'none'} />
                <span className="text-sm">{currentReactions.thumbs_up}</span>
              </button>
            </div>
          </div>
        </div>

        {announcements.length > 1 && (
          <div className="flex justify-center space-x-2 pb-3">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoScrolling(false)
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}