import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Tag } from 'lucide-react'
import { trackPageView, type Event } from '../lib/supabase'

interface MobileEventCardProps {
  event: Event
}

export const MobileEventCard: React.FC<MobileEventCardProps> = ({ event }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    trackPageView('event', event.id)
    navigate(`/events/${event.slug}`)
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

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="flex space-x-4">
        {/* Event Image */}
        <div className="flex-shrink-0">
          <img
            src={event.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=200'}
            alt={event.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        </div>

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          {/* Event Types */}
          {event.event_types && event.event_types.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {event.event_types.slice(0, 1).map((type) => (
                <span
                  key={type}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(type)}`}
                >
                  <Tag size={8} className="mr-1" />
                  {type}
                </span>
              ))}
              {event.event_types.length > 1 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{event.event_types.length - 1}
                </span>
              )}
            </div>
          )}

          {/* Event Title */}
          <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
            {event.title}
          </h3>

          {/* Time and Venue */}
          <div className="space-y-1">
            <div className="flex items-center text-gray-600 text-sm">
              <Clock size={14} className="mr-2 flex-shrink-0" />
              <span>{formatTime(event.event_date)}</span>
            </div>

            {event.venue && (
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin size={14} className="mr-2 flex-shrink-0" />
                <span className="truncate">{event.venue.name}</span>
              </div>
            )}
          </div>

          {/* Price */}
          {event.ticket_price && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ${event.ticket_price}
              </span>
            </div>
          )}

          {/* Featured Artists */}
          {event.event_artists && event.event_artists.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {event.event_artists.slice(0, 2).map((ea) => (
                  <span
                    key={ea.artist.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {ea.artist.name}
                  </span>
                ))}
                {event.event_artists.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    +{event.event_artists.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}