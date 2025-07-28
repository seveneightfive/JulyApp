import React, { useState, useEffect } from 'react'
import { Search, Filter, MapPin, X, ArrowUpDown } from 'lucide-react'
import { Layout } from '../components/Layout'
import { VenueCard } from '../components/VenueCard'
import { supabase, type Venue, trackPageView } from '../lib/supabase'

const VENUE_TYPES = ['Art Gallery', 'Live Music', 'Bar/Tavern', 'Retail', 'Restaurant', 'Event Space', 'Brewery/Winery', 'Outdoor Space', 'Theatre', 'Studio/Class', 'Community Space', 'First Friday ArtWalk', 'Coffee Shop', 'Church', 'Experiences', 'Trades + Services']
const NEIGHBORHOODS = ['Downtown', 'NOTO', 'North Topeka', 'Oakland', 'Westboro Mart', 'College Hill', 'Lake Shawnee', 'Golden Mile', 'A Short Drive', 'South Topeka', 'Midtown', 'West Topeka']

type SortOption = 'alphabetical-asc' | 'alphabetical-desc' | 'events-desc'

export const VenuesDirectoryPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([])
  const [venuesWithEventCounts, setVenuesWithEventCounts] = useState<(Venue & { eventCount: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical-asc')
  const [neighborhoodCounts, setNeighborhoodCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    trackPageView('venues-directory')
    fetchVenues()
  }, [])

  useEffect(() => {
    filterAndSortVenues()
  }, [venues, venuesWithEventCounts, searchQuery, selectedTypes, selectedNeighborhoods, sortBy])

  useEffect(() => {
    calculateNeighborhoodCounts()
  }, [venues, searchQuery, selectedTypes])

  const fetchVenues = async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching venues:', error)
    } else {
      const venuesData = data || []
      setVenues(venuesData)
      await fetchEventCounts(venuesData)
    }
    setLoading(false)
  }

  const fetchEventCounts = async (venuesData: Venue[]) => {
    const venuesWithCounts = await Promise.all(
      venuesData.map(async (venue) => {
        const { count } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('venue_id', venue.id)
          .gte('start_date', new Date().toISOString())

        return {
          ...venue,
          eventCount: count || 0
        }
      })
    )
    setVenuesWithEventCounts(venuesWithCounts)
  }

  const calculateNeighborhoodCounts = () => {
    let baseVenues = venues

    // Apply search and type filters first
    if (searchQuery) {
      baseVenues = baseVenues.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedTypes.length > 0) {
      baseVenues = baseVenues.filter(venue =>
        selectedTypes.includes(venue.venue_type)
      )
    }

    const counts: Record<string, number> = {}
    NEIGHBORHOODS.forEach(neighborhood => {
      counts[neighborhood] = baseVenues.filter(venue => 
        venue.neighborhood === neighborhood
      ).length
    })

    setNeighborhoodCounts(counts)
  }

  const filterAndSortVenues = () => {
    let filtered = venues

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(venue =>
        selectedTypes.includes(venue.venue_type)
      )
    }

    // Neighborhood filter
    if (selectedNeighborhoods.length > 0) {
      filtered = filtered.filter(venue =>
        venue.neighborhood && selectedNeighborhoods.includes(venue.neighborhood)
      )
    }

    // Apply sorting
    const filteredWithCounts = filtered.map(venue => {
      const venueWithCount = venuesWithEventCounts.find(v => v.id === venue.id)
      return {
        ...venue,
        eventCount: venueWithCount?.eventCount || 0
      }
    })

    switch (sortBy) {
      case 'alphabetical-asc':
        filteredWithCounts.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'alphabetical-desc':
        filteredWithCounts.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'events-desc':
        filteredWithCounts.sort((a, b) => {
          if (b.eventCount !== a.eventCount) {
            return b.eventCount - a.eventCount
          }
          return a.name.localeCompare(b.name)
        })
        break
    }

    setFilteredVenues(filtered)
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleNeighborhood = (neighborhood: string) => {
    setSelectedNeighborhoods(prev =>
      prev.includes(neighborhood)
        ? prev.filter(n => n !== neighborhood)
        : [...prev, neighborhood]
    )
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setSelectedNeighborhoods([])
    setSearchQuery('')
    setSortBy('alphabetical-asc')
  }

  const activeFiltersCount = selectedTypes.length + selectedNeighborhoods.length + (sortBy !== 'alphabetical-asc' ? 1 : 0)

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
                  placeholder="Search venues..."
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
                
                {/* Venue Types Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Venue Types</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {VENUE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`btn-filter transition-colors text-xs ${
                          selectedTypes.includes(type)
                            ? 'active'
                            : ''
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Neighborhoods Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Neighborhoods</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {NEIGHBORHOODS.map((neighborhood) => (
                      <button
                        key={neighborhood}
                        onClick={() => toggleNeighborhood(neighborhood)}
                        className={`btn-filter transition-colors text-xs ${
                          selectedNeighborhoods.includes(neighborhood)
                            ? 'active'
                            : ''
                        }`}
                      >
                        <div>
                          <span>{neighborhood}</span>
                          <span className="ml-2 text-xs opacity-75">({neighborhoodCounts[neighborhood] || 0})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'alphabetical-asc', label: 'A-Z' },
                      { value: 'alphabetical-desc', label: 'Z-A' },
                      { value: 'events-desc', label: 'Most Events' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as SortOption)}
                        className={`btn-filter transition-colors ${
                          sortBy === option.value
                            ? 'active'
                            : ''
                        }`}
                      >
                        {option.label}
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
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold font-oswald text-gray-900">Venues Directory</h1>
                <p className="text-gray-600 mt-2">Discover amazing local venues</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search venues..."
                    className="w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
            </div>
          </div>

          {/* Filters */}
          <div className="hidden lg:block mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Venue Types Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Venue Types</h4>
                <div className="flex flex-wrap gap-2">
                  {VENUE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`btn-filter transition-colors ${
                        selectedTypes.includes(type)
                          ? 'active'
                          : ''
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neighborhoods Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Neighborhoods</h4>
                <div className="flex flex-wrap gap-2">
                  {NEIGHBORHOODS.map((neighborhood) => (
                    <button
                      key={neighborhood}
                      onClick={() => toggleNeighborhood(neighborhood)}
                      className={`btn-filter transition-colors ${
                        selectedNeighborhoods.includes(neighborhood)
                          ? 'active'
                          : ''
                      }`}
                    >
                      <div>
                        <span>{neighborhood}</span>
                        <span className="ml-2 text-xs opacity-75">({neighborhoodCounts[neighborhood] || 0})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'alphabetical-asc', label: 'A-Z' },
                    { value: 'alphabetical-desc', label: 'Z-A' },
                    { value: 'events-desc', label: 'Most Events' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={`btn-filter transition-colors ${
                        sortBy === option.value
                          ? 'active'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <ArrowUpDown size={14} />
                        <span>{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${filteredVenues.length} venue${filteredVenues.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Venues Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          {!loading && filteredVenues.length === 0 && (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}