import React, { useState, useEffect } from 'react'
import { Search, Filter, MapPin, X } from 'lucide-react'
import { Layout } from '../components/Layout'
import { VenueCard } from '../components/VenueCard'
import { supabase, type Venue, trackPageView } from '../lib/supabase'

const VENUE_TYPES = ['Art Gallery', 'Live Music', 'Bar/Tavern', 'Retail', 'Restaurant', 'Event Space', 'Brewery/Winery', 'Outdoor Space', 'Theatre', 'Studio/Class', 'Community Space', 'First Friday ArtWalk', 'Coffee Shop', 'Church', 'Experiences', 'Trades + Services']
const NEIGHBORHOODS = ['Downtown', 'NOTO', 'North Topeka', 'Oakland', 'Westboro Mart', 'College Hill', 'Lake Shawnee', 'Golden Mile', 'A Short Drive', 'South Topeka', 'Midtown', 'West Topeka']

export const VenuesDirectoryPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    trackPageView('venues-directory')
    fetchVenues()
  }, [])

  useEffect(() => {
    filterVenues()
  }, [venues, searchQuery, selectedTypes, selectedNeighborhoods])

  const fetchVenues = async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching venues:', error)
    } else {
      setVenues(data || [])
    }
    setLoading(false)
  }

  const filterVenues = () => {
    let filtered = venues

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Venue type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(venue =>
        selectedTypes.includes(venue.venue_type) ||
        venue.venue_types?.some(type => selectedTypes.includes(type))
      )
    }

    // Neighborhood filter
    if (selectedNeighborhoods.length > 0) {
      filtered = filtered.filter(venue =>
        venue.neighborhood && selectedNeighborhoods.includes(venue.neighborhood)
      )
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
  }

  const activeFiltersCount = selectedTypes.length + selectedNeighborhoods.length

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Venues</h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg"
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
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venues..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                
                {/* Venue Type Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Venue Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {VENUE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          selectedTypes.includes(type)
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Neighborhood Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Neighborhood</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {NEIGHBORHOODS.map((neighborhood) => (
                      <button
                        key={neighborhood}
                        onClick={() => toggleNeighborhood(neighborhood)}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          selectedNeighborhoods.includes(neighborhood)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {neighborhood}
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
                <h1 className="text-3xl font-bold text-gray-900">Venues Directory</h1>
                <p className="text-gray-600 mt-2">Discover amazing venues in your area</p>
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
                  placeholder="Search venues..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="hidden lg:block mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Venue Type Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Venue Type</h4>
                <div className="flex flex-wrap gap-2">
                  {VENUE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selectedTypes.includes(type)
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neighborhood Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Neighborhood</h4>
                <div className="flex flex-wrap gap-2">
                  {NEIGHBORHOODS.map((neighborhood) => (
                    <button
                      key={neighborhood}
                      onClick={() => toggleNeighborhood(neighborhood)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selectedNeighborhoods.includes(neighborhood)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {neighborhood}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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