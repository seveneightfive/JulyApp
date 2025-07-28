import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Phone, Globe, Heart, Share2, ArrowLeft, Users, Calendar } from 'lucide-react'
import { Layout } from '../components/Layout'
import { ReviewSection } from '../components/ReviewSection'
import { EventCard } from '../components/EventCard'
import { useAuth } from '../hooks/useAuth'
import { supabase, type Venue, type Event, trackPageView } from '../lib/supabase'

export const VenueDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchVenue()
      fetchVenueEvents()
    }
  }, [slug])

  useEffect(() => {
    if (venue && user) {
      checkFollowStatus()
    }
  }, [venue, user])

  const fetchVenue = async () => {
    if (!slug) return

    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching venue:', error)
      navigate('/venues')
      return
    }

    setVenue(data)
    trackPageView('venue', data.id)
    setLoading(false)
  }

  const fetchVenueEvents = async () => {
    if (!slug) return

    const { data } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues!inner(slug),
        event_artists(
          artist:artists(*)
        )
      `)
      .eq('venue.slug', slug)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })

    if (data) {
      setEvents(data)
    }
  }

  const checkFollowStatus = async () => {
    if (!venue || !user) return

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('entity_type', 'venue')
      .eq('entity_id', venue.id)
      .single()

    setIsFollowing(!!data)
  }

  const handleFollow = async () => {
    if (!user || !venue) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('entity_type', 'venue')
          .eq('entity_id', venue.id)
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            entity_type: 'venue',
            entity_id: venue.id
          })
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error following venue:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue?.name,
          text: venue?.description,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </Layout>
    )
  }

  if (!venue) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Venue not found</h1>
            <button
              onClick={() => navigate('/venues')}
              className="text-teal-600 hover:text-teal-700"
            >
              Back to Venues
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="aspect-[16/9] lg:aspect-[21/9] relative overflow-hidden">
            {venue.image_url ? (
              <img
                src={venue.image_url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                <MapPin size={64} className="text-white opacity-80" />
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

            {/* Venue Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {/* Venue Logo */}
                  {venue.logo && (
                    <div className="mb-4">
                      <div className="w-[150px] h-[150px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img
                          src={venue.logo}
                          alt={`${venue.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {venue.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                      {venue.venue_type}
                    </span>
                    {venue.capacity && (
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        <span className="text-sm">Capacity: {venue.capacity}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start text-gray-700">
                      <MapPin size={20} className="mr-3 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">{venue.address}</div>
                        <div className="text-sm text-gray-500">
                          {venue.city}, {venue.state} {venue.country}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {venue.phone && (
                        <a
                          href={`tel:${venue.phone}`}
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Phone size={16} className="mr-2" />
                          <span className="text-sm">{venue.phone}</span>
                        </a>
                      )}
                      {venue.website && (
                        <a
                          href={venue.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Globe size={16} className="mr-2" />
                          <span className="text-sm">Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {venue.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Venue</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {venue.description}
                  </p>
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {events.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Address</h3>
                    <p className="text-gray-600">
                      {venue.address}<br />
                      {venue.city}, {venue.state} {venue.country}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {venue.phone && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Phone</h3>
                        <a
                          href={`tel:${venue.phone}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {venue.phone}
                        </a>
                      </div>
                    )}
                    {venue.email && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                        <a
                          href={`mailto:${venue.email}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {venue.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection entityType="venue" entityId={venue.id} />
          </div>
        </div>
      </div>
    </Layout>
  )
}