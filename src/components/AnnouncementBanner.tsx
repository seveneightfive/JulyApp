import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Megaphone, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, type Announcement, type AnnouncementReaction } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export const AnnouncementBanner: React.FC = () => {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [reactionCounts, setReactionCounts] = useState<Record<string, { no: number, yes: number }>>({})
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({})
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAnnouncements()
    loadHiddenAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements.length > 1 && isAutoScrolling) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [announcements.length, isAutoScrolling])

  const loadHiddenAnnouncements = () => {
    if (!user) {
      // Load from cookies for non-logged in users
      const hiddenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('hiddenAnnouncements='))
      
      if (hiddenCookie) {
        try {
          const hiddenIds = JSON.parse(decodeURIComponent(hiddenCookie.split('=')[1]))
          setHiddenAnnouncements(new Set(hiddenIds))
        } catch (error) {
          console.error('Error parsing hidden announcements cookie:', error)
        }
      }
    }
  }

  const saveHiddenAnnouncement = (announcementId: string) => {
    if (!user) {
      // Save to cookies for non-logged in users
      const newHidden = new Set([...hiddenAnnouncements, announcementId])
      setHiddenAnnouncements(newHidden)
      
      const hiddenArray = Array.from(newHidden)
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1) // 1 year expiry
      
      document.cookie = `hiddenAnnouncements=${encodeURIComponent(JSON.stringify(hiddenArray))}; expires=${expires.toUTCString()}; path=/`
    } else {
      // For logged in users, it's handled by the database reaction
      setHiddenAnnouncements(new Set([...hiddenAnnouncements, announcementId]))
    }
  }

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
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

    const counts: Record<string, { no: number, yes: number }> = {}
    announcementIds.forEach(id => {
      counts[id] = { no: 0, yes: 0 }
    })

    data?.forEach(reaction => {
      if (counts[reaction.announcement_id]) {
        if (reaction.reaction_type === 'thumbs_up') {
          counts[reaction.announcement_id].yes++
        } else if (reaction.reaction_type === 'heart') {
          counts[reaction.announcement_id].no++
        }
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

    // Hide announcements that logged-in users have voted on
    const votedAnnouncementIds = Object.keys(reactions)
    if (votedAnnouncementIds.length > 0) {
      setHiddenAnnouncements(prev => new Set([...prev, ...votedAnnouncementIds]))
    }
  }

  const handleReaction = async (announcementId: string, reactionType: 'heart' | 'thumbs_up') => {
    // Track the vote
    if (user) {
      await supabase
        .from('announcement_reactions')
        .insert({
          user_id: user.id,
          announcement_id: announcementId,
          reaction_type: reactionType
        })
    } else {
      // For non-logged in users, we still track in the database but without user_id
      await supabase
        .from('announcement_reactions')
        .insert({
          user_id: null,
          announcement_id: announcementId,
          reaction_type: reactionType
        })
    }

    // Hide the announcement
    saveHiddenAnnouncement(announcementId)

    // Refresh data
    fetchReactionCounts([announcementId])
    if (user) {
      fetchUserReactions([announcementId])
    }
  }

  const nextAnnouncement = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const prevAnnouncement = () => {
    setIsAutoScrolling(false)
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  // Filter out hidden announcements
  const visibleAnnouncements = announcements.filter(announcement => 
    !hiddenAnnouncements.has(announcement.id)
  )

  if (!isVisible || visibleAnnouncements.length === 0) {
    return null
  }

  const currentAnnouncement = visibleAnnouncements[currentIndex % visibleAnnouncements.length]
  const currentReactions = reactionCounts[currentAnnouncement?.id] || { no: 0, yes: 0 }
  const currentUserReactions = userReactions[currentAnnouncement?.id] || []

  const getEntityLink = (announcement: Announcement) => {
    if (announcement.entity_type === 'event' && announcement.entity_id) {
      return `/events/${announcement.entity_id}`
    }
    if (announcement.entity_type === 'artist' && announcement.entity_id) {
      return `/artists/${announcement.entity_id}`
    }
    if (announcement.entity_type === 'venue' && announcement.entity_id) {
      return `/venues/${announcement.entity_id}`
    }
    return null
  }

  const getEntityName = (announcement: Announcement) => {
    if (announcement.entity_type === 'event') {
      return 'Event'
    }
    if (announcement.entity_type === 'artist') {
      return 'Artist'
    }
    if (announcement.entity_type === 'venue') {
      return 'Venue'
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
              {visibleAnnouncements.length > 1 && (
                <button
                  onClick={prevAnnouncement}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  onMouseEnter={() => setIsAutoScrolling(false)}
                  onMouseLeave={() => setIsAutoScrolling(true)}
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              
              {visibleAnnouncements.length > 1 && (
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
            
            {/* Relevance Question and Voting */}
            <div className="space-y-2">
              <p className="text-sm text-white/90">Did you find this announcement relevant?</p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => handleReaction(currentAnnouncement.id, 'heart')}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
                >
                  <span>No</span>
                  <span className="text-xs">({currentReactions.no})</span>
                </button>
                
                <button
                  onClick={() => handleReaction(currentAnnouncement.id, 'thumbs_up')}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
                >
                  <span>Yes</span>
                  <span className="text-xs">({currentReactions.yes})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {visibleAnnouncements.length > 1 && (
          <div className="flex justify-center space-x-2 pb-3">
            {visibleAnnouncements.map((_, index) => (
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