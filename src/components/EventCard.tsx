import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react'
import { supabase, type Event } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface EventCardProps {
  event: Event
  featured?: boolean
}

const getEventTypeColor = (eventType: string) => {
  const colors: { [key: string]: string } = {
    'Art': 'bg-pink-500 text-white',
    'Entertainment': 'bg-purple-500 text-white',
    'Lifestyle': 'bg-blue-500 text-white',
    'Local Flavor': 'bg-green-500 text-white',
    'Live Music': 'bg-teal-500 text-white',
    'Party For A Cause': 'bg-orange-500 text-white',
    'Community / Cultural': 'bg-indigo-500 text-white',
    'Shop Local': 'bg-yellow-500 text-black'
  }
  return colors[eventType] || 'bg-gray-500 text-white'
}

const getEventTypeAbbreviation = (eventType: string) => {
  const abbreviations: { [key: string]: string } = {
    'Art': 'ART',
    'Entertainment': 'ENT',
    'Lifestyle': 'LIFE',
    'Local Flavor': 'FLAVOR',
    'Live Music': 'MUSIC',
    'Party For A Cause': 'CAUSE',
    'Community / Cultural': 'COMM',
    'Shop Local': 'SHOP'
  }
  return abbreviations[eventType] || eventType.toUpperCase()
}

export const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const { user } = useAuth()
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | 'not_going' | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchRsvpStatus()
    }
  }, [user, event.id])

  const fetchRsvpStatus = async () => {
    if (!user) return

    const { data } = await supabase
      .from('event_rsvps')
      .select('status')
      .eq('user_id', user.id)
      .eq('event_id', event.id)
      .single()

    if (data) {
      setRsvpStatus(data.status as any)
    }
  }

  const handleRsvp = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user || rsvpLoading) return

    setRsvpLoading(true)

    try {
      const newStatus = rsvpStatus === 'going' ? null : 'going'

      if (newStatus === null) {
        // Remove RSVP
        await supabase
          .from('event_rsvps')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', event.id)
      } else {
        // Add or update RSVP
        await supabase
          .from('event_rsvps')
          .upsert({
            user_id: user.id,
            event_id: event.id,
            status: newStatus
          })
      }

      setRsvpStatus(newStatus)
    } catch (error) {
      console.error('Error updating RSVP:', error)
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleCardClick = () => {
    window.location.href = `/events/${event.slug || event.id}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const primaryEventType = event.event_types?.[0]

  if (featured) {
    return (
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="aspect-video relative">
          <img
            src={event.image_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {primaryEventType && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(primaryEventType)}`}>
                  {getEventTypeAbbreviation(primaryEventType)}
                </span>
              )}
            </div>
            {user && (
              <button
                onClick={handleRsvp}
                disabled={rsvpLoading}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  rsvpStatus === 'going'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rsvpLoading ? '...' : rsvpStatus === 'going' ? 'Going' : 'RSVP'}
              </button>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {event.title}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(event.event_date)} at {formatTime(event.event_date)}</span>
            </div>
            {event.venue && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.venue.name}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {event.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {event.ticket_price && (
                <span className="text-lg font-bold text-green-600">
                  ${event.ticket_price}
                </span>
              )}
            </div>
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Get Tickets
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="aspect-video relative">
        <img
          src={event.image_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {primaryEventType && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(primaryEventType)}`}>
                {getEventTypeAbbreviation(primaryEventType)}
              </span>
            )}
            {event.ticket_price && (
              <span className="text-sm font-bold text-green-600">
                ${event.ticket_price}
              </span>
            )}
          </div>
          {user && (
            <button
              onClick={handleRsvp}
              disabled={rsvpLoading}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                rsvpStatus === 'going'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rsvpLoading ? '...' : rsvpStatus === 'going' ? 'Going' : 'RSVP'}
            </button>
          )}
        </div>
        
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{formatTime(event.event_date)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="truncate">{event.venue.name}</span>
            </div>
          )}
        </div>

        {event.ticket_url && (
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-full justify-center"
          >
            Get Tickets
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        )}
      </div>
    </div>
  )
}