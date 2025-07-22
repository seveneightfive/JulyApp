import React, { useState, useEffect } from 'react'
import { Calendar, Music, MapPin, Heart, Users, TrendingUp, Clock, Star } from 'lucide-react'
import { Layout } from '../components/Layout'
import { EventCard } from '../components/EventCard'
import { ArtistCard } from '../components/ArtistCard'
import { VenueCard } from '../components/VenueCard'
import { useAuth } from '../hooks/useAuth'
import { supabase, type Event, type Artist, type Venue, type Follow, type EventRSVP, trackPageView } from '../lib/supabase'

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([])
  const [followedVenues, setFollowedVenues] = useState<Venue[]>([])
  const [rsvpEvents, setRsvpEvents] = useState<Event[]>([])
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    followedArtists: 0,
    followedVenues: 0,
    rsvpEvents: 0,
    upcomingEvents: 0
  })
  const [loading, setLoading] = useState(true)

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
            event_artists!inner(is_featured, artist:artists(*))
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'going')
        .gte('event.start_date', new Date().toISOString())

      if (rsvps) {
        const events = rsvps.map(rsvp => rsvp.event).filter(Boolean)
        setRsvpEvents(events)
      }

      // Fetch recommended events (from followed artists/venues)
      const artistIds = artistFollows?.map(f => f.entity_id) || []
      const venueIds = venueFollows?.map(f => f.entity_id) || []

      let recommendedEventsQuery = supabase
        .from('events')
        .select(`
          *,
          venue:venues(*),
          event_artists(artist:artists(*))
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(6)

      if (artistIds.length > 0 || venueIds.length > 0) {
        if (venueIds.length > 0) {
          recommendedEventsQuery = recommendedEventsQuery.in('venue_id', venueIds)
        }
        // Note: For artist-based recommendations, we'd need a more complex query
        // For now, we'll show venue-based recommendations
      }

      const { data: recommended } = await recommendedEventsQuery

      if (recommended) {
        setRecommendedEvents(recommended)
      }

      // Update stats
      setStats({
        followedArtists: artistFollows?.length || 0,
        followedVenues: venueFollows?.length || 0,
        rsvpEvents: rsvps?.length || 0,
        upcomingEvents: recommended?.length || 0
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {profile?.full_name || profile?.username}!</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {profile?.full_name || profile?.username}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Music className="text-purple-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.followedArtists}</p>
                  <p className="text-sm text-gray-600">Artists</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <MapPin className="text-teal-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.followedVenues}</p>
                  <p className="text-sm text-gray-600">Venues</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="text-green-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.rsvpEvents}</p>
                  <p className="text-sm text-gray-600">RSVPs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </div>
          </div>

          {/* RSVP Events */}
          {rsvpEvents.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Your Events</h2>
                <a href="/events" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All Events
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rsvpEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} variant="featured" />
                ))}
              </div>
            </section>
          )}

          {/* Recommended Events */}
          {recommendedEvents.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Recommended for You</h2>
                <a href="/events" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All Events
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {/* Followed Artists */}
          {followedArtists.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Following</h2>
                <a href="/artists" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Discover More Artists
                </a>
              </div>
              
              {/* Desktop Grid */}
              <div className="hidden lg:grid grid-cols-3 gap-6">
                {followedArtists.slice(0, 3).map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
              
              {/* Mobile Horizontal Scroll */}
              <div className="lg:hidden overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                  {followedArtists.map((artist) => (
                    <div key={artist.id} className="flex-shrink-0 w-64">
                      <ArtistCard artist={artist} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Followed Venues */}
          {followedVenues.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Favorite Venues</h2>
                <a href="/venues" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Discover More Venues
                </a>
              </div>
              
              {/* Desktop Grid */}
              <div className="hidden lg:grid grid-cols-3 gap-6">
                {followedVenues.slice(0, 3).map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
              
              {/* Mobile Horizontal Scroll */}
              <div className="lg:hidden overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                  {followedVenues.map((venue) => (
                    <div key={venue.id} className="flex-shrink-0 w-64">
                      <VenueCard venue={venue} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {stats.followedArtists === 0 && stats.followedVenues === 0 && stats.rsvpEvents === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <Heart size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Network</h3>
                <p className="text-gray-600 mb-6">
                  Follow your favorite artists and venues to get personalized recommendations and never miss an event.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href="/artists"
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Discover Artists
                  </a>
                  <a
                    href="/venues"
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                  >
                    Find Venues
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}