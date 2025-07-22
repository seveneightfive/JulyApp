import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Heart, Share2, ArrowLeft, ExternalLink, Star } from 'lucide-react'
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
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | 'not_going' | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpCounts, setRsvpCounts] = useState({ going: 0, interested: 0 })

  useEffect(() => {
    if (slug) {
      fetchEvent()
    }
  }, [slug])

  useEffect(() => {
    if (event && user) {
      checkRsvpStatus()
      fetchRsvpCounts()
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

  const checkRsvpStatus = async () => {
    if (!event || !user) return

    const { data } = await supabase
      .from('event_rsvps')
      .select('status')
      .eq('user_id', user.id)
      .eq('event_id', event.id)
      .single()

    if (data) {
      setRsvpStatus(data.status as 'going' | 'interested' | 'not_going')
    }
  }

  const fetchRsvpCounts = async () => {
    if (!event) return

    const [goingCount, interestedCount] = await Promise.all([
      supabase
        .from('event_rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'going'),
      supabase
        .from('event_rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'interested')
    ])

    setRsvpCounts({
      going: goingCount.count || 0,
      interested: interestedCount.count || 0
    })
  }

  const handleRsvp = async (status: 'going' | 'interested' | 'not_going') => {
    if (!user || !event) return

    setRsvpLoading(true)
    try {
      if (rsvpStatus === status) {
        // Remove RSVP if clicking the same status
        await supabase
          .from('event_rsvps')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', event.id)
        setRsvpStatus(null)
      } else {
        // Upsert RSVP
        await supabase
          .from('event_rsvps')
          .upsert({
            user_id: user.id,
            event_id: event.id,
            status
          })
        setRsvpStatus(status)
      }
      fetchRsvpCounts()
    } catch (error) {
      console.error('Error updating RSVP:', error)
    } finally {
      setRsvpLoading(false)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Art': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Lifestyle': 'bg-green-100 text-green-800',
      'Local Flavor': 'bg-orange-100 text-orange-800',
      'Live Music': 'bg-blue-100 text-blue-800',
      'Party For A Cause': 'bg-red-100 text-red-800',
      'Community / Cultural': 'bg-indigo-100 text-indigo-800',
      'Shop Local': 'bg-yellow-100 text-yellow-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
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
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
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
                  <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {event.title}
                  </h1>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Calendar size={20} className="mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">{formatDate(event.event_date)}</div>
                        <div className="text-sm text-gray-500">
                          {formatTime(event.event_date)}
                          {event.end_date && ` - ${formatTime(event.end_date)}`}
                        </div>
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

                    {event.capacity && (
                      <div className="flex items-center text-gray-700">
                        <Users size={20} className="mr-3 text-gray-400" />
                        <span className="text-sm">Capacity: {event.capacity}</span>
                      </div>
                    )}

                    {event.ticket_price && (
                      <div className="flex items-center text-green-600 font-semibold text-lg">
                        <span>${event.ticket_price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Types */}
              {event.event_types && event.event_types.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.event_types.map((type) => (
                    <span
                      key={type}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}

              {/* RSVP Buttons */}
              {user && (
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => handleRsvp('going')}
                    disabled={rsvpLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      rsvpStatus === 'going'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    Going ({rsvpCounts.going})
                  </button>
                  <button
                    onClick={() => handleRsvp('interested')}
                    disabled={rsvpLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      rsvpStatus === 'interested'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    Interested ({rsvpCounts.interested})
                  </button>
                </div>
              )}
            </div>

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

            {/* Artists */}
            {event.event_artists && event.event_artists.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Artists</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.event_artists.map((eventArtist) => (
                    <div key={eventArtist.artist.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        {eventArtist.artist.avatar_url && (
                          <img
                            src={eventArtist.artist.avatar_url}
                            alt={eventArtist.artist.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{eventArtist.artist.name}</h3>
                          {eventArtist.is_featured && (
                            <span className="inline-flex items-center text-xs text-yellow-600">
                              <Star size={12} className="mr-1" />
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Information */}
            {event.ticket_url && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tickets</h2>
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Get Your Tickets</h3>
                      {event.ticket_price && (
                        <p className="text-2xl font-bold text-green-600">${event.ticket_price}</p>
                      )}
                    </div>
                    <a
                      href={event.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <span>Buy Tickets</span>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Venue Information */}
            {event.venue && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Venue</h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{event.venue.name}</h3>
                      <p className="text-gray-600 mb-3">
                        {event.venue.address}<br />
                        {event.venue.city}, {event.venue.state} {event.venue.country}
                      </p>
                      {event.venue.description && (
                        <p className="text-gray-600 text-sm">{event.venue.description}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {event.venue.phone && (
                        <div>
                          <span className="font-medium text-gray-900">Phone: </span>
                          <a href={`tel:${event.venue.phone}`} className="text-blue-600 hover:text-blue-700">
                            {event.venue.phone}
                          </a>
                        </div>
                      )}
                      {event.venue.website && (
                        <div>
                          <span className="font-medium text-gray-900">Website: </span>
                          <a
                            href={event.venue.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
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