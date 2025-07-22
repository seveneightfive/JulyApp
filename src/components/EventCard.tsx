import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Tag } from 'lucide-react'
import { trackPageView, type Event } from '../lib/supabase'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'featured' | 'compact'
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant = 'default' }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    trackPageView('event', event.id)
    navigate(`/events/${event.slug}`)
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

  const cardClasses = variant === 'featured' 
    ? 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-blue-200'
    : variant === 'compact'
    ? 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer'
    : 'bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer'

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Event Image */}
      <div className="relative">
        <img
          src={event.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={event.title}
          className={`w-full object-cover ${variant === 'compact' ? 'h-32' : 'h-48'} rounded-t-xl`}
        />
        {event.ticket_price && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-lg text-sm font-semibold text-gray-900">
            ${event.ticket_price}
          </div>
        )}
      </div>

      <div className={variant === 'compact' ? 'p-4' : 'p-6'}>
        {/* Event Types */}
        {event.event_types && event.event_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {event.event_types.slice(0, 2).map((type) => (
              <span
                key={type}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(type)}`}
              >
                <Tag size={10} className="mr-1" />
                {type}
              </span>
            ))}
            {event.event_types.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{event.event_types.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Event Title */}
        <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 ${variant === 'compact' ? 'text-lg' : 'text-xl'}`}>
          {event.title}
        </h3>

        {/* Event Description */}
        {event.description && variant !== 'compact' && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2">
          {/* Date and Time */}
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar size={16} className="mr-2 flex-shrink-0" />
            <span>{formatDate(event.event_date)} at {formatTime(event.event_date)}</span>
          </div>

          {/* Venue */}
          {event.venue && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={16} className="mr-2 flex-shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </div>
          )}

          {/* Capacity */}
          {event.capacity && (
            <div className="flex items-center text-gray-600 text-sm">
              <Users size={16} className="mr-2 flex-shrink-0" />
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
        </div>

        {/* Featured Artists */}
        {event.event_artists && event.event_artists.length > 0 && variant !== 'compact' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Featured Artists:</p>
            <div className="flex flex-wrap gap-2">
              {event.event_artists.slice(0, 3).map((ea) => (
                <span
                  key={ea.artist.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {ea.artist.name}
                </span>
              ))}
              {event.event_artists.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{event.event_artists.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}