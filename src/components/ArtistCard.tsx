import React, { useState } from 'react'
import { Music, Heart, Calendar, Star } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase, type Artist, trackPageView } from '../lib/supabase'

interface ArtistCardProps {
  artist: Artist
  onFollow?: () => void
  variant?: 'default' | 'featured' | 'compact'
  upcomingEventsCount?: number
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onFollow, variant = 'default', upcomingEventsCount }) => {
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
          .eq('entity_type', 'artist')
          .eq('entity_id', artist.id)
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            entity_type: 'artist',
            entity_id: artist.id
          })
      }
      setIsFollowing(!isFollowing)
      onFollow?.()
    } catch (error) {
      console.error('Error following artist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    trackPageView('artist', artist.id)
    window.location.href = `/artists/${artist.slug}`
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer" onClick={handleClick}>
        <div className="flex items-center p-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mr-3">
            {artist.avatar_url || artist.image_url ? (
              <img src={artist.avatar_url || artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music size={20} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{artist.name}</h3>
            {artist.tagline ? (
              <p className="text-xs text-gray-500 line-clamp-1">{artist.tagline}</p>
            ) : artist.genre && (
              <p className="text-xs text-gray-500 line-clamp-1">{artist.genre}</p>
            )}
            {upcomingEventsCount !== undefined && upcomingEventsCount > 0 && (
              <p className="text-xs text-gray-400">{upcomingEventsCount} upcoming events</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="aspect-square relative overflow-hidden">
          {artist.avatar_url || artist.image_url ? (
            <img
              src={artist.avatar_url || artist.image_url}
              alt={artist.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music size={48} className="text-white opacity-80" />
            </div>
          )}
          
          <div className="absolute top-4 right-4 flex space-x-2">
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
            className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors mb-2"
            onClick={handleClick}
          >
            {artist.name}
          </h3>

          {artist.tagline && (
            <div className="flex items-center text-gray-600 mb-3">
              <span className="text-sm italic">{artist.tagline}</span>
            </div>
          )}

          {upcomingEventsCount !== undefined && (
            <div className="flex items-center text-gray-600 mb-3">
              <Calendar size={16} className="mr-3 text-gray-400" />
              <span className="text-sm">{upcomingEventsCount} upcoming events</span>
            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="aspect-square relative overflow-hidden">
        {artist.avatar_url || artist.image_url ? (
          <img
            src={artist.avatar_url || artist.image_url}
            alt={artist.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music size={32} className="text-white opacity-80" />
          </div>
        )}
        
        <div className="absolute top-3 right-3 flex space-x-2">
          {artist.verified && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <Star size={10} className="mr-1" />
              Verified
            </div>
          )}
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
          className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors mb-2 line-clamp-1"
          onClick={handleClick}
        >
          {artist.name}
        </h3>

        {artist.tagline && (
          <div className="flex items-center text-gray-500 mb-3">
            <span className="text-xs italic">{artist.tagline}</span>
          </div>
        )}

        {upcomingEventsCount !== undefined && (
          <div className="flex items-center text-gray-500 mb-3">
            <Calendar size={14} className="mr-2 text-gray-400" />
            <span className="text-xs">{upcomingEventsCount} upcoming events</span>
          </div>
        )}

        {!artist.tagline && artist.genre && (
          <div className="text-xs text-gray-500 mt-2">{artist.genre}</div>
        )}
      </div>
    </div>
  )
}