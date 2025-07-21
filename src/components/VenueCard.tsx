import React from 'react'
import { MapPin, Phone, Globe, Users } from 'lucide-react'
import { trackPageView, type Venue } from '../lib/supabase'

interface VenueCardProps {
  venue: Venue
  variant?: 'default' | 'featured' | 'compact'
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, variant = 'default' }) => {
  const handleClick = () => {
    trackPageView('venue', venue.id)
    window.location.href = `/venues/${venue.slug}`
  }

  const getVenueTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Art Gallery': 'bg-purple-100 text-purple-800',
      'Live Music': 'bg-blue-100 text-blue-800',
      'Bar/Tavern': 'bg-amber-100 text-amber-800',
      'Restaurant': 'bg-green-100 text-green-800',
      'Event Space': 'bg-indigo-100 text-indigo-800',
      'Brewery/Winery': 'bg-orange-100 text-orange-800',
      'Coffee Shop': 'bg-yellow-100 text-yellow-800',
      'Theatre': 'bg-red-100 text-red-800',
      'Outdoor Space': 'bg-emerald-100 text-emerald-800',
      'Community Space': 'bg-cyan-100 text-cyan-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          {(venue.image_url || venue.avatar_url) && (
            <img
              src={venue.image_url || venue.avatar_url}
              alt={venue.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">{venue.address}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div 
        onClick={handleClick}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="aspect-[16/9] relative">
          {venue.image_url || venue.avatar_url ? (
            <img
              src={venue.image_url || venue.avatar_url}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <MapPin size={48} className="text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-2">{venue.name}</h3>
            <div className="flex items-center text-white/90 text-sm">
              <MapPin size={14} className="mr-1" />
              <span>{venue.address}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {venue.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{venue.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {venue.venue_types?.slice(0, 3).map((type) => (
              <span
                key={type}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getVenueTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            {venue.capacity && (
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                <span>Capacity: {venue.capacity}</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              {venue.phone && (
                <Phone size={14} />
              )}
              {venue.website && (
                <Globe size={14} />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="aspect-[4/3] relative">
        {venue.image_url || venue.avatar_url ? (
          <img
            src={venue.image_url || venue.avatar_url}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <MapPin size={32} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{venue.name}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{venue.address}</span>
        </div>
        {venue.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{venue.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mb-3">
          {venue.venue_types?.slice(0, 2).map((type) => (
            <span
              key={type}
              className={`px-2 py-1 rounded-full text-xs font-medium ${getVenueTypeColor(type)}`}
            >
              {type}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          {venue.capacity && (
            <div className="flex items-center">
              <Users size={14} className="mr-1" />
              <span>{venue.capacity}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {venue.phone && (
              <Phone size={14} />
            )}
            {venue.website && (
              <Globe size={14} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}