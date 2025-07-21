import React, { useState, useEffect } from 'react'
import { Calendar, Music, MapPin, TrendingUp, Users, Star, ArrowRight, Sparkles } from 'lucide-react'
import { Layout } from '../components/Layout'
import { AnnouncementBanner } from '../components/AnnouncementBanner'
import { EventCard } from '../components/EventCard'
import { ArtistCard } from '../components/ArtistCard'
import { VenueCard } from '../components/VenueCard'
import { supabase, type Event, type Artist, type Venue, trackPageView } from '../lib/supabase'

export const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([])
  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>([])
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalArtists: 0,
    totalVenues: 0,
    totalUsers: 0
  })

  useEffect(() => {
    trackPageView('home')
    fetchFeaturedContent()
    fetchStats()
  }, [])

  const fetchFeaturedContent = async () => {
    // Fetch upcoming events
    const { data: events } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        event_artists(
          artist:artists(*),
          is_featured
        )
      `)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3)

    if (events) setFeaturedEvents(events)

    // Fetch recent events for mobile list
    const { data: recentEventsData } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        event_artists(
          artist:artists(*),
          is_featured
        )
      `)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(6)

    if (recentEventsData) setRecentEvents(recentEventsData)

    // Fetch featured artists with event counts
    const { data: artistsData } = await supabase
      .from('artists')
      .select(`
        *,
        event_artists!inner(
          event:events!inner(
            id,
            event_date
          )
        )
      `)
      .eq('verified', true)
      .gte('event_artists.event.event_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(6)

    // Process artists with event counts
    if (artistsData) {
      const artistsWithCounts = artistsData.map(artist => ({
        ...artist,
        upcomingEventsCount: artist.event_artists?.length || 0
      }))
      setFeaturedArtists(artistsWithCounts)
    }

    // Fetch featured venues with event counts
    const { data: venuesData } = await supabase
      .from('venues')
      .select(`
        *,
        events!inner(
          id,
          event_date
        )
      `)
      .gte('events.event_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(6)

    // Process venues with event counts
    if (venuesData) {
      const venuesWithCounts = venuesData.map(venue => ({
        ...venue,
        upcomingEventsCount: venue.events?.length || 0
      }))
      setFeaturedVenues(venuesWithCounts)
    }
  }

  const fetchStats = async () => {
    const [eventsCount, artistsCount, venuesCount, usersCount] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('artists').select('id', { count: 'exact', head: true }),
      supabase.from('venues').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
    ])

    setStats({
      totalEvents: eventsCount.count || 0,
      totalArtists: artistsCount.count || 0,
      totalVenues: venuesCount.count || 0,
      totalUsers: usersCount.count || 0
    })
  }

  return (
    <Layout>
      <AnnouncementBanner />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Sparkles size={32} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Events & Artists
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Connect with the entertainment community and never miss the experiences you love
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <a
                href="/events"
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                Browse Events
                <ArrowRight size={16} className="ml-2" />
              </a>
              <a
                href="/artists"
                className="border-2 border-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Discover Artists
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Desktop */}
      <section className="hidden lg:block py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-blue-600" size={28} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
              <div className="text-gray-600 text-sm">Events</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Music className="text-purple-600" size={28} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalArtists}</div>
              <div className="text-gray-600 text-sm">Artists</div>
            </div>
            <div className="text-center">
              <div className="bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-teal-600" size={28} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalVenues}</div>
              <div className="text-gray-600 text-sm">Venues</div>
            </div>
            <div className="text-center">
              <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={28} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
              <div className="text-gray-600 text-sm">Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events - Desktop */}
      <section className="hidden lg:block py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
              <p className="text-gray-600 mt-2">Don't miss these amazing upcoming events</p>
            </div>
            <a href="/events" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All
              <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Events List */}
      <section className="lg:hidden py-6 bg-white">
        <div className="px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
            <a href="/events" className="text-blue-600 text-sm font-medium">View All</a>
          </div>
          <div className="space-y-3">
            {recentEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Featured Artists</h2>
              <p className="text-gray-600 mt-1 lg:mt-2 hidden lg:block">Discover talented artists in your area</p>
            </div>
            <a href="/artists" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All
              <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {featuredArtists.slice(0, 3).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} variant="featured" />
            ))}
          </div>
          
          {/* Mobile Horizontal Scroll */}
          <div className="lg:hidden overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {featuredArtists.map((artist) => (
                <div key={artist.id} className="flex-shrink-0 w-64">
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Popular Venues</h2>
              <p className="text-gray-600 mt-1 lg:mt-2 hidden lg:block">Explore amazing venues hosting great events</p>
            </div>
            <a href="/venues" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All
              <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {featuredVenues.slice(0, 3).map((venue) => (
              <VenueCard key={venue.id} venue={venue} variant="featured" />
            ))}
          </div>
          
          {/* Mobile Horizontal Scroll */}
          <div className="lg:hidden overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {featuredVenues.map((venue) => (
                <div key={venue.id} className="flex-shrink-0 w-64">
                  <VenueCard venue={venue} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-lg lg:text-xl mb-8 text-white/90">
            Create your profile, follow your favorite artists, and never miss an event
          </p>
          <a
            href="/signup"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
          >
            Get Started
            <ArrowRight size={16} className="ml-2" />
          </a>
        </div>
      </section>
    </Layout>
  )
}