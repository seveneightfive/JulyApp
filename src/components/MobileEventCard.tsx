import React from 'react'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { Event, trackPageView } from '../lib/supabase'

interface MobileEventCardProps {
  event: Event
}

export const MobileEventCard: React.FC<MobileEventCardProps> = ({ event }) => {
  const handleClick = () => {
    trackPageView('event', event.id);
    window.location.href = `/events/${event.slug}`;
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Art': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Lifestyle': 'bg-green-100 text-green-800',
      'Local Flavor': 'bg-orange-100 text-orange-800',
      'Live Music': 'bg-blue-100 text-blue-800',
      'Party For A Cause': 'bg-red-100 text-red-800',
      'Community / Cultural': 'bg-indigo-100 text-indigo-800',
      'Shop Local': 'bg-yellow-100 text-yellow-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex">
        {/* Event Image */}
        <div className="w-20 h-20 flex-shrink-0">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate pr-2">
              {event.title}
            </h3>
            <div className="text-xs text-gray-500 flex-shrink-0">
              {formatTime(event.event_date)}
            </div>
          </div>

          <div className="space-y-1 mb-2">
            {event.venue && (
              <div className="flex items-center text-xs text-gray-600">
                <MapPin size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">{event.venue.name}</span>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-600">
              <Clock size={12} className="mr-1 flex-shrink-0" />
              <span>{formatDate(event.event_date)}</span>
            </div>
          </div>

          {/* Event Types */}
          {event.event_types && event.event_types.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.event_types.slice(0, 2).map((type) => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(type)}`}
                >
                  {type}
                </span>
              ))}
              {event.event_types.length > 2 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{event.event_types.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}