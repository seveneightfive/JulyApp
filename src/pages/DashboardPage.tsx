import React, { useState, useEffect } from 'react'
import { Calendar, Music, MapPin, Heart, Users, TrendingUp, Clock, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { EventCard } from '../components/EventCard'
import { ArtistCard } from '../components/ArtistCard'
import { VenueCard } from '../components/VenueCard'
import { useAuth } from '../hooks/useAuth'
import { supabase, type Event, type Artist, type Venue, type Follow, type EventRSVP, trackPageView } from '../lib/supabase'

interface DashboardModal {
  type: 'artists' | 'venues' | 'rsvps' | 'upcoming' | null
  isOpen: boolean
}

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([])
  const [followedVenues, setFollowedVenues] = useState<Venue[]>([])
  const [rsvpEvents, setRsvpEvents] = useState<Event[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    followedArtists: 0,
    followedVenues: 0,
    rsvpEvents: 0,
    upcomingEvents: 0
  })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<DashboardModal>({ type: null, isOpen: false })

  useEffect(() => {
    trackPageView('dashboard')
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch followed artists
      const { data: artistFollows } = await supabase
        .from('follows')
        .select(`
          *,
          artist:artists(*)
        `)
        .eq('follower_id', user.id)
        .eq('entity_type', 'artist')

      if (artistFollows) {
        const artists = artistFollows.map(follow => follow.artist).filter(Boolean)
        setFollowedArtists(artists)
      }

      // Fetch followed venues
      const { data: venueFollows } = await supabase
        .from('follows')
        .select(`
          *,
          venue:venues(*)
        `)
        .eq('follower_id', user.id)
        .eq('entity_type', 'venue')

      if (venueFollows) {
        const venues = venueFollows.map(follow => follow.venue).filter(Boolean)
        setFollowedVenues(venues)
      }

      // Fetch RSVP events
      const { data: rsvps } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          event:events(
            *,
            venue:venues(*),
            event_artists(artist:artists(*))
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'going')
        .gte('event.start_date', new Date().toISOString())

      if (rsvps) {
        const events = rsvps.map(rsvp => rsvp.event).filter(Boolean)
        setRsvpEvents(events)
      }

      // Fetch upcoming events from followed artists and venues
      const artistIds = artistFollows?.map(f => f.entity_id) || []
      const venueIds = venueFollows?.map(f => f.entity_id) || []

      let upcomingEventsData: Event[] = []

      // Get events from followed venues
      if (venueIds.length > 0) {
        const { data: venueEvents } = await supabase
          .from('events')
          .select(`
            *,
            venue:venues(*),
            event_artists(artist:artists(*))
          `)
          .in('venue_id', venueIds)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })

        if (venueEvents) {
          upcomingEventsData = [...upcomingEventsData, ...venueEvents]
        }
      }

      // Get events from followed artists
      if (artistIds.length > 0) {
        const { data: artistEvents } = await supabase
          .from('events')
          .select(`
            *,
            venue:venues(*),
            event_artists!inner(artist:artists(*))
          `)
          .in('event_artists.artist_id', artistIds)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })

        if (artistEvents) {
          // Remove duplicates and merge
          const existingEventIds = new Set(upcomingEventsData.map(e => e.id))
          const newEvents = artistEvents.filter(e => !existingEventIds.has(e.id))
          upcomingEventsData = [...upcomingEventsData, ...newEvents]
        }
      }

      // Sort by date
      upcomingEventsData.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      setUpcomingEvents(upcomingEventsData)

      // Update stats
      setStats({
        followedArtists: artistFollows?.length || 0,
        followedVenues: venueFollows?.length || 0,
        rsvpEvents: rsvps?.length || 0,
        upcomingEvents: upcomingEventsData.length
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (type: 'artists' | 'venues' | 'rsvps' | 'upcoming') => {
    setModal({ type, isOpen: true })
  }

  const closeModal = () => {
    setModal({ type: null, isOpen: false })
  }

  const renderModalContent = () => {
    switch (modal.type) {
      case 'artists':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Following Artists ({stats.followedArtists})</h3>
            {followedArtists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {followedArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You're not following any artists yet.</p>
                <Link to="/artists" className="btn-pink mt-4 inline-block">
                  Discover Artists
                </Link>
              </div>
            )}
          </div>
        )
      
      case 'venues':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Following Venues ({stats.followedVenues})</h3>
            {followedVenues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {followedVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You're not following any venues yet.</p>
                <Link to="/venues" className="btn-yellow mt-4 inline-block">
                  Discover Venues
                </Link>
              </div>
            )}
          </div>
        )
      
      case 'rsvps':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Your RSVPs ({stats.rsvpEvents})</h3>
            {rsvpEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {rsvpEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You haven't RSVP'd to any events yet.</p>
                <Link to="/events" className="btn-pink mt-4 inline-block">
                  Browse Events
                </Link>
              </div>
            )}
          </div>
        )
      
      case 'upcoming':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Upcoming Events ({stats.upcomingEvents})</h3>
            <p className="text-sm text-gray-600">Events from artists and venues you follow</p>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No upcoming events from your followed artists and venues.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                  <Link to="/artists" className="btn-pink">
                    Follow Artists
                  </Link>
                  <Link to="/venues" className="btn-yellow">
                    Follow Venues
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
            <p className="text-gray-600">You need to be signed in to view your dashboard.</p>
          </div>
        </div>
      </Layout>
    )
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Banner */}
        <div className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl lg:text-4xl font-bold font-oswald mb-2">DASHBOARD</h1>
            <p className="text-lg text-white/90">
              Welcome back, {profile?.full_name || profile?.username || 'User'}!
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <button
              onClick={() => openModal('artists')}
              className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Music className="text-purple-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.followedArtists}</p>
                  <p className="text-sm text-gray-600">Artists</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => openModal('venues')}
              className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="bg-teal-100 p-3 rounded-lg group-hover:bg-teal-200 transition-colors">
                  <MapPin className="text-teal-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.followedVenues}</p>
                  <p className="text-sm text-gray-600">Venues</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => openModal('rsvps')}
              className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Calendar className="text-green-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.rsvpEvents}</p>
                  <p className="text-sm text-gray-600">RSVPs</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => openModal('upcoming')}
              className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/events"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Calendar className="text-blue-600 mr-3" size={20} />
                <span className="font-medium text-gray-900">Browse Events</span>
              </Link>
              <Link
                to="/artists"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Music className="text-purple-600 mr-3" size={20} />
                <span className="font-medium text-gray-900">Discover Artists</span>
              </Link>
              <Link
                to="/venues"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MapPin className="text-teal-600 mr-3" size={20} />
                <span className="font-medium text-gray-900">Find Venues</span>
              </Link>
            </div>
          </div>

          {/* Empty State */}
          {stats.followedArtists === 0 && stats.followedVenues === 0 && stats.rsvpEvents === 0 && (
            <div className="text-center py-12 mt-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <Heart size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Network</h3>
                <p className="text-gray-600 mb-6">
                  Follow your favorite artists and venues to get personalized recommendations and never miss an event.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to="/artists"
                    className="btn-pink"
                  >
                    Discover Artists
                  </Link>
                  <Link
                    to="/venues"
                    className="btn-yellow"
                  >
                    Find Venues
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  {renderModalContent()}
                </div>
                <button
                  onClick={closeModal}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}