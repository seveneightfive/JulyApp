import React, { useState, useEffect } from 'react'
import { Search, Filter, Calendar, X, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { EventCard } from '../components/EventCard'
import { supabase, type Event, trackPageView } from '../lib/supabase'

const EVENT_TYPES = ['Art', 'Entertainment', 'Lifestyle', 'Local Flavor', 'Live Music', 'Party For A Cause', 'Community / Cultural', 'Shop Local']

export const EventsDirectoryPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({
    all: 0,
    today: 0,
    week: 0,
    month: 0
  })

  useEffect(() => {
    trackPageView('events-directory')
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
    calculateEventCounts()
  }, [events, searchQuery, selectedTypes, dateFilter])

  const fetchEvents = async () => {
    // Get current date in local timezone, start of day
    const now = new Date()
    const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const oneDayAgo = new Date(localToday.getTime() - 24 * 60 * 60 * 1000)
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        event_artists!inner(is_featured, artist:artists(*))
      `)
      .gte('start_date', oneDayAgo.toISOString())
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  const calculateEventCounts = () => {
    // Use local timezone for date calculations
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    let baseEvents = events

    // Apply search and type filters first
    if (searchQuery) {
      baseEvents = baseEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_artists?.some(ea => 
          ea.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (selectedTypes.length > 0) {
      baseEvents = baseEvents.filter(event =>
        event.event_types?.some(type => selectedTypes.includes(type))
      )
    }

    const counts = {
      all: baseEvents.length,
      today: baseEvents.filter(event => {
        const eventDate = new Date(event.start_date)
        return eventDate >= today && eventDate < tomorrow
      }).length,
      week: baseEvents.filter(event => {
        const eventDate = new Date(event.start_date)
        return eventDate >= today && eventDate < weekFromNow
      }).length,
      month: baseEvents.filter(event => {
        const eventDate = new Date(event.start_date)
        return eventDate >= today && eventDate < monthFromNow
      }).length
    }

    setEventCounts(counts)
  }

  const filterEvents = () => {
    let filtered = events

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_artists?.some(ea => 
          ea.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(event =>
        event.event_types?.some(type => selectedTypes.includes(type))
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date)
        
        switch (dateFilter) {
          case 'today':
            return eventDate >= today && eventDate < tomorrow
          case 'week':
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            return eventDate >= today && eventDate < weekFromNow
          case 'month':
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
            return eventDate >= today && eventDate < monthFromNow
          default:
            return true
        }
      })
    }

    setFilteredEvents(filtered)
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setDateFilter('all')
    setSearchQuery('')
  }

  const activeFiltersCount = selectedTypes.length + (dateFilter !== 'all' ? 1 : 0)

  // Group events by date for mobile view
  const groupEventsByDate = (events: Event[]) => {
    const grouped: { [key: string]: Event[] } = {}
    
    events.forEach(event => {
      const eventDate = new Date(event.start_date)
      const dateKey = eventDate.toDateString()
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    
    // Sort events within each date by start time
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
    })
    
    return grouped
  }

  const groupedEvents = groupEventsByDate(filteredEvents)
  const sortedDateKeys = Object.keys(groupedEvents).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  )

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg flex-shrink-0"
              >
                <Filter size={16} />
                <span className="text-sm">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)}></div>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6 pb-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Date Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">When</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'all', label: 'All Upcoming', count: eventCounts.all },
                      { value: 'today', label: 'Today', count: eventCounts.today },
                      { value: 'week', label: 'This Week', count: eventCounts.week },
                      { value: 'month', label: 'This Month', count: eventCounts.month }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDateFilter(option.value as any)}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          dateFilter === option.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-75">{option.count} events</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Types Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Event Types</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          selectedTypes.includes(type)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
               <h1 className="text-3xl font-bold font-oswald text-gray-900">Events Directory</h1>
                <p className="text-gray-600 mt-2">Discover amazing upcoming events</p>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <X size={16} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="hidden lg:block mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Date Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">When</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Upcoming', count: eventCounts.all },
                    { value: 'today', label: 'Today', count: eventCounts.today },
                    { value: 'week', label: 'This Week', count: eventCounts.week },
                    { value: 'month', label: 'This Month', count: eventCounts.month }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDateFilter(option.value as any)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        dateFilter === option.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span>{option.label}</span>
                        <span className="ml-2 text-xs opacity-75">({option.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Types Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Event Types</h4>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selectedTypes.includes(type)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Mobile Layout - Date Grouped */}
              <div className="lg:hidden space-y-6">
                {sortedDateKeys.map((dateKey) => {
                  const date = new Date(dateKey)
                  const dayNumber = date.getDate()
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
                  
                  return (
                    <div key={dateKey} className="space-y-3">
                      {/* Date Header */}
                      <div className="flex items-center space-x-4 px-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 font-medium">{monthName}</div>
                          <div className="text-2xl font-bold text-gray-900">{dayNumber}</div>
                        </div>
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <div className="text-sm text-gray-500 font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Events for this date */}
                      <div className="space-y-3">
                        {groupedEvents[dateKey].map((event) => (
                          <MobileEventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Desktop Layout - Grid */}
              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

// Mobile Event Card Component with horizontal layout
const MobileEventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formatTime = () => {
    if (event.event_start_time) {
      try {
        const dummyDate = new Date(`2000-01-01T${event.event_start_time}`)
        if (isNaN(dummyDate.getTime())) {
          return null
        }
        return dummyDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      } catch (error) {
        return null
      }
    }
    return null
  }

  const formatEventDate = () => {
    try {
      const eventDate = new Date(event.start_date)
      if (isNaN(eventDate.getTime())) {
        return 'Invalid Date'
      }
      return eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }
  const featuredArtists = event.event_artists?.filter(ea => ea.is_featured) || []
  const otherArtists = event.event_artists?.filter(ea => !ea.is_featured) || []
  const allArtists = [...featuredArtists, ...otherArtists]

  return (
    <Link 
      to={`/events/${event.slug}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden mx-4"
    >
      <div className="flex">
        {/* Event Image - 16:9 aspect ratio */}
        <div className="w-24 h-16 bg-gray-200 overflow-hidden flex-shrink-0">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white opacity-50" />
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-1 p-3 min-w-0">
          {/* Event Title */}
          <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1 font-oswald">
            {event.title}
          </h3>

          {/* Time and Venue */}
          <div className="space-y-1 text-xs text-gray-600">
            {event.start_date && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>{formatEventDate()}{formatTime() ? ` • ${formatTime()}` : ''}</span>
              </div>
            )}
            
            {event.venue && (
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{event.venue.name}</span>
              </div>
            )}
          </div>

          {/* Artists */}
          {allArtists.length > 0 && (
            <div className="mt-1">
              <div className="flex flex-wrap gap-1">
                {allArtists.slice(0, 2).map((eventArtist) => (
                  <span
                    key={eventArtist.artist.id}
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      eventArtist.is_featured
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {eventArtist.artist.name}
                  </span>
                ))}
                {allArtists.length > 2 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    +{allArtists.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}