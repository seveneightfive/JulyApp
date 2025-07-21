import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, DollarSign, Users, ExternalLink, ArrowLeft, Heart, Share2, Star, Check, UserCheck } from 'lucide-react'
import { Layout } from '../components/Layout'
import { ReviewSection } from '../components/ReviewSection'
import { useAuth } from '../hooks/useAuth'
import { supabase, type Event, type EventRSVP, trackPageView } from '../lib/supabase'

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | 'not_going' | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpCount, setRsvpCount] = useState(0)

  useEffect(() => {
    if (slug) {
      fetchEvent()
    }
  }, [slug])

  useEffect(() => {
    if (event && user) {
      checkFollowStatus()
      checkRSVPStatus()
    }
    if (event) {
      fetchRSVPCount()
    }
  }, [event, user])

  const fetchEvent = async () => {
    if (!slug) return

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        event_artists(
          artist:artists(*),
          is_featured
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      navigate('/events')
      return
    }

    setEvent(data)
    trackPageView('event', data.id)
    setLoading(false)
  }

  const checkFollowStatus = async () => {
    if (!event || !user) return

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('entity_type', 'event')
      .eq('entity_id', event.id)
      .single()

    setIsFollowing(!!data)
  }

  const checkRSVPStatus = async () => {
    if (!event || !user) return

    const { data } = await supabase
      .from('event_rsvps')
      .select('status')
      .eq('user_id', user.id)
      .eq('event_id', event.id)
      .single()

    if (data) {
      setRsvpStatus(data.status)
    }
  }

  const fetchRSVPCount = async () => {
    if (!event) return

    const { count } = await supabase
      .from('event_rsvps')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('status', 'going')

    setRsvpCount(count || 0)
  }

  const handleFollow = async () => {
    if (!user || !event) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('entity_type', 'event')
          .eq('entity_id', event.id)
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            entity_type: 'event',
            entity_id: event.id
          })
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error following event:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleRSVP = async (status: 'going' | 'interested' | 'not_going') => {
    if (!user || !event) return

    setRsvpLoading(true)
    try {
      if (rsvpStatus) {
        // Update existing RSVP
        await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('user_id', user.id)
          .eq('event_id', event.id)
      } else {
        // Create new RSVP
        await supabase
          .from('event_rsvps')
          .insert({
            user_id: user.id,
            event_id: event.id,
            status
          })
      }
      setRsvpStatus(status)
      fetchRSVPCount() // Refresh count
    } catch (error) {
      console.error('Error updating RSVP:', error)
    } finally {
      setRsvpLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (!event) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
            <button
              onClick={() => navigate('/events')}
              className="text-blue-600 hover:text-blue-700"
            >
              Back to Events
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const eventDate = formatDate(event.event_date)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Share2 size={20} />
              </button>
              {user && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`p-2 rounded-full transition-colors ${
                    isFollowing 
                      ? 'bg-red-50 text-red-600' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart size={20} fill={isFollowing ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="aspect-[16/9] lg:aspect-[21/9] relative overflow-hidden">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Calendar size={64} className="text-white opacity-80" />
              </div>
            )}
            
            {/* Desktop Actions Overlay */}
            <div className="hidden lg:block absolute top-6 right-6">
              <div className="flex space-x-3">
                <button
                  onClick={handleShare}
                  className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Share2 size={20} />
                </button>
                {user && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                      isFollowing 
                        ? 'bg-red-500/20 text-red-600' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart size={20} fill={isFollowing ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white lg:rounded-t-3xl lg:-mt-8 relative z-10 p-6 lg:p-8">
            {/* Desktop Back Button */}
            <div className="hidden lg:block mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </button>
            </div>

            {/* Event Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {event.event_type}
                    </span>
                    {event.ticket_price && (
                      <span className="text-green-600 font-semibold">
                        ${event.ticket_price}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar size={20} className="mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">{eventDate.date}</div>
                      <div className="text-sm text-gray-500">{eventDate.time}</div>
                    </div>
                  </div>

                  {event.venue && (
                    <div className="flex items-start text-gray-700">
                      <MapPin size={20} className="mr-3 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">{event.venue.name}</div>
                        <div className="text-sm text-gray-500">
                          {event.venue.address}, {event.venue.city}
                        </div>
                      </div>
                    </div>
                  )}

                  {event.event_artists && event.event_artists.length > 0 && (
                    <div className="flex items-center text-gray-700">
                      <Star size={20} className="mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {event.event_artists.map(ea => ea.artist.name).join(', ')}
                        </div>
                        {event.event_artists[0]?.artist.genre && (
                          <div className="text-sm text-gray-500">{event.event_artists[0].artist.genre}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {event.capacity && (
                    <div className="flex items-center text-gray-700">
                      <Users size={20} className="mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">Capacity: {event.capacity}</div>
                        {rsvpCount > 0 && (
                          <div className="text-sm text-gray-500">{rsvpCount} people going</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ticket/Action Section */}
                <div className="lg:pl-8">
                  {/* RSVP Buttons */}
                  {user && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Will you attend?</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRSVP('going')}
                          disabled={rsvpLoading}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            rsvpStatus === 'going'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Check size={16} className="inline mr-1" />
                          Going
                        </button>
                        <button
                          onClick={() => handleRSVP('interested')}
                          disabled={rsvpLoading}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            rsvpStatus === 'interested'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Star size={16} className="inline mr-1" />
                          Interested
                        </button>
                      </div>
                    </div>
                  )}

                  {event.ticket_url ? (
                    <a
                      href={event.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center mb-4"
                    >
                      Get Tickets
                      <ExternalLink size={16} className="ml-2" />
                    </a>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-500 py-4 px-6 rounded-xl text-center mb-4">
                      Tickets not available online
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="space-y-2">
                    {event.venue && (
                      <a
                        href={`/venues/${event.venue.slug}`}
                        className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Venue Details →
                      </a>
                    )}
                    {event.event_artists && event.event_artists.length > 0 && (
                      <a
                        href={`/artists/${event.event_artists[0].artist.slug}`}
                        className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Artist Profile →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Section */}
            {event.venue && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Venue</h2>
                <a
                  href={`/venues/${event.venue.slug}`}
                  className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                      {event.venue.image_url ? (
                        <img
                          src={event.venue.image_url}
                          alt={event.venue.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <MapPin size={24} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.venue.name}</h3>
                      <p className="text-sm text-gray-600">
                        {event.venue.address}, {event.venue.city}
                      </p>
                      {event.venue.capacity && (
                        <p className="text-sm text-gray-500">Capacity: {event.venue.capacity}</p>
                      )}
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Featured Artists Section */}
            {event.event_artists && event.event_artists.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Artists</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.event_artists.map((eventArtist) => (
                    <a
                      key={eventArtist.artist.id}
                      href={`/artists/${eventArtist.artist.slug}`}
                      className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                          {eventArtist.artist.image_url ? (
                            <img
                              src={eventArtist.artist.image_url}
                              alt={eventArtist.artist.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <Music size={24} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-900">{eventArtist.artist.name}</h3>
                            {eventArtist.is_featured && (
                              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                Featured
                              </span>
                            )}
                            {eventArtist.artist.verified && (
                              <Star size={14} className="ml-2 text-blue-500" />
                            )}
                          </div>
                          {eventArtist.artist.genre && (
                            <p className="text-sm text-gray-600">{eventArtist.artist.genre}</p>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewSection entityType="event" entityId={event.id} />
          </div>
        </div>
      </div>
    </Layout>
  )
}