import React, { useState } from 'react'
import { MapPin, Phone, Globe, Heart, Users, Clock, Eye } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase, type Venue, trackPageView } from '../lib/supabase'

interface VenueCardProps {
  venue: Venue
  onFollow?: () => void
  variant?: 'default' | 'featured' | 'compact'
  upcomingEventsCount?: number
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, onFollow, variant = 'default', upcomingEventsCount }) => {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (!user) return
    
    setIsLoading(true)
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
      onFollow?.()
    } catch (error) {
      console.error('Error following venue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    trackPageView('venue', venue.id)
    window.location.href = `/venues/${venue.slug}`
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer" onClick={handleClick}>
        <div className="flex">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 flex-shrink-0 relative">
            {venue.image_url ? (
              <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin size={24} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 p-3">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{venue.name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{venue.address}, {venue.city}</p>
            {venue.capacity && (
              <p className="text-xs text-gray-400 mt-1">Capacity: {venue.capacity}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="aspect-[4/3] relative overflow-hidden">
          {venue.image_url ? (
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <MapPin size={48} className="text-white opacity-80" />
            </div>
          )}
          
          <div className="absolute top-4 right-4">
            {user && (
              <button
                onClick={handleFollow}
                disabled={isLoading}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isFollowing 
                    ? 'bg-red-500/20 text-red-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart size={18} fill={isFollowing ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <h3 
            className="text-xl font-bold font-oswald text-gray-900 hover:text-blue-600 cursor-pointer transition-colors mb-3"
            onClick={handleClick}
          >
            {venue.name}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPin size={16} className="mr-3 text-gray-400" />
              <span className="text-sm">{venue.address}, {venue.city}</span>
            </div>
            
            {venue.capacity && (
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-3 text-gray-400" />
                <span className="text-sm">Capacity: {venue.capacity}</span>
              </div>
            )}

            {upcomingEventsCount !== undefined && (
              <div className="flex items-center text-gray-600">
                <Clock size={16} className="mr-3 text-gray-400" />
                <span className="text-sm">{upcomingEventsCount} upcoming events</span>
              </div>
            )}
          </div>

          {venue.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {venue.description}
            </p>
          )}

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {venue.phone && (
                <div className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Phone size={16} />
                </div>
              )}
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Globe size={16} />
                </a>
              )}
            </div>
            
            <button
              onClick={handleClick}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View Details
              <Eye size={14} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="aspect-[16/10] relative overflow-hidden">
        {venue.image_url ? (
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <MapPin size={32} className="text-white opacity-80" />
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          {user && (
            <button
              onClick={handleFollow}
              disabled={isLoading}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isFollowing 
                  ? 'bg-red-500/20 text-red-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart size={16} fill={isFollowing ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 
          className="font-semibold font-oswald text-gray-900 hover:text-blue-600 cursor-pointer transition-colors mb-2 line-clamp-2"
          onClick={handleClick}
        >
          {venue.name}
        </h3>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-gray-500">
            <MapPin size={14} className="mr-2" />
            <span className="text-xs line-clamp-1">{venue.address}, {venue.city}</span>
          </div>
          
          {venue.capacity && (
            <div className="flex items-center text-gray-500">
              <Users size={14} className="mr-2" />
              <span className="text-xs">Capacity: {venue.capacity}</span>
            </div>
          )}

          {upcomingEventsCount !== undefined && (
            <div className="flex items-center text-gray-500">
              <Clock size={14} className="mr-2" />
              <span className="text-xs">{upcomingEventsCount} events</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {venue.venue_type}
          </span>
          
          <button
            onClick={handleClick}
            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
          >
            View →
          </button>
        </div>
      </div>
    </div>
  )
}