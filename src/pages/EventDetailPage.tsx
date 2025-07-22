import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  ExternalLink, 
  ArrowLeft,
  Star,
  Heart,
  Share2,
  Music,
  Palette
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { ReviewSection } from '../components/ReviewSection'
import { supabase, type Event, type EventRSVP, trackPageView } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null)
  const [rsvpCounts, setRsvpCounts] = useState({ going: 0, interested: 0 })

  useEffect(() => {
    if (slug) {
      fetchEvent()
      trackPageView('event', event?.id)
    }
  }, [slug])

  useEffect(() => {
    if (event && user) {
      fetchRSVPStatus()
    }
    if (event) {
      fetchRSVPCounts()
    }
  }, [event, user])

  const fetchEvent = async () => {
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
    } else {
      setEvent(data)
    }
    setLoading(false)
  }

  const fetchRSVPStatus = async () => {
    if (!event || !user) return

    const { data } = await supabase
      .from('event_rsvps')
      .select('status')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single()

    setRsvpStatus(data?.status || null)
  }

  const fetchRSVPCounts = async () => {
    if (!event) return

    const { data } = await supabase
      .from('event_rsvps')
      .select('status')
      .eq('event_id', event.id)

    const counts = { going: 0, interested: 0 }
    data?.forEach(rsvp => {
      if (rsvp.status === 'going') counts.going++
      if (rsvp.status === 'interested') counts.interested++
    })

    setRsvpCounts(counts)
  }

  const handleRSVP = async (status: string) => {
    if (!user || !event) return

    if (rsvpStatus === status) {
      // Remove RSVP
      await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', event.id)
        .eq('user_id', user.id)
      
      setRsvpStatus(null)
    } else {
      // Add or update RSVP
      await supabase
        .from('event_rsvps')
        .upsert({
          event_id: event.id,
          user_id: user.id,
          status
        })
      
      setRsvpStatus(status)
    }

    fetchRSVPCounts()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimeOfDay = (timeString: string) => {
    const dummyDate = new Date(`2000-01-01T${timeString}`)
    return dummyDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago'
    })
  }

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
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
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (!event) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <button
              onClick={() => navigate('/events')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Events
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/events')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Events
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Image */}
              {event.image_url && (
                <div className="mb-8">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-64 md:h-80 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Event Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.event_types?.map((type) => (
                    <span
                      key={type}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

                {event.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{event.description}</p>
                )}

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Calendar className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Date</p>
                      <p className="text-gray-600">{formatDate(event.event_date)}</p>
                      {event.end_date && event.end_date !== event.event_date && (
                        <p className="text-gray-600">to {formatDate(event.end_date)}</p>
                      )}
                    </div>
                  </div>

                  {(event.event_start_time || event.event_end_time) && (
                    <div className="flex items-start space-x-3">
                      <Clock className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Time</p>
                        <p className="text-gray-600">
                          {event.event_start_time && formatTimeOfDay(event.event_start_time)}
                          {event.event_end_time && ` - ${formatTimeOfDay(event.event_end_time)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.venue && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Venue</p>
                        <p className="text-gray-600">{event.venue.name}</p>
                        <p className="text-gray-500 text-sm">{event.venue.address}</p>
                      </div>
                    </div>
                  )}

                  {event.capacity && (
                    <div className="flex items-start space-x-3">
                      <Users className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Capacity</p>
                        <p className="text-gray-600">{event.capacity} people</p>
                      </div>
                    </div>
                  )}

                  {event.ticket_price && (
                    <div className="flex items-start space-x-3">
                      <DollarSign className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Price</p>
                        <p className="text-gray-600">${event.ticket_price}</p>
                      </div>
                    </div>
                  )}

                  {event.ticket_url && (
                    <div className="flex items-start space-x-3">
                      <ExternalLink className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Tickets</p>
                        <a
                          href={event.ticket_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Get Tickets
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Artists */}
              {event.event_artists && event.event_artists.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Artists</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.event_artists.map(({ artist, is_featured }) => (
                      <div
                        key={artist.id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/artists/${artist.slug}`)}
                      >
                        {artist.avatar_url ? (
                          <img
                            src={artist.avatar_url}
                            alt={artist.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {artist.artist_type === 'Musician' ? (
                              <Music size={20} className="text-gray-500" />
                            ) : (
                              <Palette size={20} className="text-gray-500" />
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{artist.name}</h3>
                          {artist.tagline && (
                            <p className="text-sm text-gray-600">{artist.tagline}</p>
                          )}
                          {is_featured && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <ReviewSection entityType="event" entityId={event.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* RSVP Section */}
              {user && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">RSVP</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleRSVP('going')}
                      className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-colors ${
                        rsvpStatus === 'going'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50'
                      }`}
                    >
                      <Heart size={16} />
                      <span>Going ({rsvpCounts.going})</span>
                    </button>
                    <button
                      onClick={() => handleRSVP('interested')}
                      className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-colors ${
                        rsvpStatus === 'interested'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      <Star size={16} />
                      <span>Interested ({rsvpCounts.interested})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Venue Details */}
              {event.venue && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Venue Details</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.venue.name}</h4>
                      <p className="text-gray-600 text-sm">{event.venue.address}</p>
                      <p className="text-gray-600 text-sm">
                        {event.venue.city}, {event.venue.state}
                      </p>
                    </div>
                    
                    {event.venue.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{event.venue.phone}</p>
                      </div>
                    )}
                    
                    {event.venue.website && (
                      <div>
                        <a
                          href={event.venue.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Visit Website →
                        </a>
                      </div>
                    )}
                    
                    <button
                      onClick={() => navigate(`/venues/${event.venue?.slug}`)}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Venue Details
                    </button>
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Share Event</h3>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: event.title,
                        text: event.description,
                        url: window.location.href
                      })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share Event</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}