import React from 'react'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { supabase, type Event, trackPageView } from '../lib/supabase'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'featured' | 'compact'
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant = 'default' }) => {
  const handleClick = () => {
    trackPageView('event', event.id);
    window.location.href = `/events/${event.slug}`;
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

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex space-x-4">
          {event.image_url && (
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin size={14} className="mr-1" />
              {event.venue?.name}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <Clock size={14} className="mr-1" />
              {formatDate(event.event_date)} at {formatTime(event.event_date)}
            </p>
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
        {event.image_url && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.title}</h3>
            {event.ticket_price && (
              <span className="text-lg font-semibold text-green-600 ml-2">
                ${event.ticket_price}
              </span>
            )}
          </div>
          
          {event.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
          )}
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-2" />
              <span className="text-sm">{formatDate(event.event_date)} at {formatTime(event.event_date)}</span>
            </div>
            {event.venue && (
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2" />
                <span className="text-sm">{event.venue.name}</span>
              </div>
            )}
            {event.capacity && (
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-2" />
                <span className="text-sm">Capacity: {event.capacity}</span>
              </div>
            )}
          </div>

          {event.event_types && event.event_types.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.event_types.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(type)}`}
                >
                  {type}
                </span>
              ))}
              {event.event_types.length > 3 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{event.event_types.length - 3} more
                </span>
              )}
            </div>
          )}
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
      {event.image_url && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{event.title}</h3>
          {event.ticket_price && (
            <span className="text-sm font-medium text-green-600 ml-2">
              ${event.ticket_price}
            </span>
          )}
        </div>
        
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-2" />
            <span className="text-sm">{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock size={14} className="mr-2" />
            <span className="text-sm">{formatTime(event.event_date)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center text-gray-600">
              <MapPin size={14} className="mr-2" />
              <span className="text-sm">{event.venue.name}</span>
            </div>
          )}
        </div>

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
  )
}