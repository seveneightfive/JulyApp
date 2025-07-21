import React, { useState } from 'react'
import { Calendar, MapPin, Clock, DollarSign, Heart, Star, Eye, Users, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase, type Event, type EventRSVP, trackPageView } from '../lib/supabase'

interface EventCardProps {
  event: Event
  onFollow?: () => void
  variant?: 'default' | 'featured' | 'compact'
}

export const EventCard: React.FC<EventCardProps> = ({ event, onFollow, variant = 'default' }) => {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | 'not_going' | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  React.useEffect(() => {
    if (user) {
      checkRSVPStatus()
    }
  }, [user, event.id])

  const checkRSVPStatus = async () => {
    if (!user) return

    const { data } = await supabase
      .from('event_rsvps')
      .select('status')
      .eq('user_id', user.id)
      .eq('event_id', event.id)
      .single()

    if (data) {
      setRsvpStatus(data.status)
    }
  }

  const handleRSVP = async (status: 'going' | 'interested' | 'not_going') => {
    if (!user) return

    setRsvpLoading(true)
    try {
      if (rsvpStatus) {
        // Update existing RSVP
        await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('user_id', user.id)
          .eq('event_id', event.id)
      } else {
        // Create new RSVP
        await supabase
          .from('event_rsvps')
          .insert({
            user_id: user.id,
            event_id: event.id,
            status
          })
      }
      setRsvpStatus(status)
    } catch (error) {
      console.error('Error updating RSVP:', error)
    } finally {
      setRsvpLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleFollow = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('entity_type', 'event')
          .eq('entity_id', event.id)
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            entity_type: 'event',
            entity_id: event.id
          })
      }
      setIsFollowing(!isFollowing)
      onFollow?.()
    } catch (error) {
      console.error('Error following event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    trackPageView('event', event.id)
    window.location.href = `/events/${event.slug}`
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer" onClick={handleClick}>
        <div className="flex">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 relative">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 p-3">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{event.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{formatDate(event.event_date)}</p>
            {event.venue && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{event.venue.name}</p>
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
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calendar size={48} className="text-white opacity-80" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            {user && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRSVP('going')}
                  disabled={rsvpLoading}
                  className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                    rsvpStatus === 'going'
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Check size={18} />
                </button>
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
              </div>
            )}
          </div>
          {event.ticket_price && (
            <div className="absolute bottom-4 left-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                ${event.ticket_price}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 
            className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors mb-3"
            onClick={handleClick}
          >
            {event.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-3 text-gray-400" />
              <span className="text-sm">{formatDate(event.event_date)}</span>
            </div>
            
            {event.venue && (
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-3 text-gray-400" />
                <span className="text-sm">{event.venue.name}</span>
              </div>
            )}
            
            {event.event_artists && event.event_artists.length > 0 && (
              <div className="flex items-center text-gray-600">
                <Star size={16} className="mr-3 text-gray-400" />
                <span className="text-sm">
                  {event.event_artists.map(ea => ea.artist.name).join(', ')}
                </span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {event.event_type}
            </span>
            
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
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Calendar size={32} className="text-white opacity-80" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          {user && (
            <div className="flex space-x-1">
              <button
                onClick={() => handleRSVP('going')}
                disabled={rsvpLoading}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  rsvpStatus === 'going'
                    ? 'bg-green-500/20 text-green-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleFollow}
                disabled={isLoading}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isFollowing 
                    ? 'bg-red-500/20 text-red-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart size={14} fill={isFollowing ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 
          className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors mb-2 line-clamp-2"
          onClick={handleClick}
        >
          {event.title}
        </h3>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-gray-500">
            <Calendar size={14} className="mr-2" />
            <span className="text-xs">{formatDate(event.event_date)}</span>
          </div>
          
          {event.venue && (
            <div className="flex items-center text-gray-500">
              <MapPin size={14} className="mr-2" />
              <span className="text-xs line-clamp-1">{event.venue.name}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          {event.ticket_price ? (
            <span className="text-green-600 font-semibold text-sm">${event.ticket_price}</span>
          ) : (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {event.event_type}
            </span>
          )}
          
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