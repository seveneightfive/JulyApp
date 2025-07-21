import React from 'react'
import { MapPin, Clock, DollarSign } from 'lucide-react'
import { Event, trackPageView } from '../lib/supabase'

interface MobileEventCardProps {
  event: Event
}

export const MobileEventCard: React.FC<MobileEventCardProps> = ({ event }) => {
  const handleClick = () => {
    trackPageView('event', event.id)
    window.location.href = `/events/${event.slug}`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
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
    return abbreviations[eventType] || eventType.substring(0, 4).toUpperCase()
  }

  const getEventTypeColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      'Art': 'bg-pink-500',
      'Entertainment': 'bg-purple-500',
      'Lifestyle': 'bg-blue-500',
      'Local Flavor': 'bg-green-500',
      'Live Music': 'bg-teal-500',
      'Party For A Cause': 'bg-orange-500',
      'Community / Cultural': 'bg-indigo-500',
      'Shop Local': 'bg-yellow-500'
    }
    return colors[eventType] || 'bg-gray-500'
  }

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative"
      onClick={handleClick}
    >
      <div className="flex">
        {/* Event Image - Facebook cover proportions (1.91:1) */}
        <div className="w-20 h-[42px] flex-shrink-0 relative overflow-hidden rounded-l-lg">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Clock size={16} className="text-white opacity-80" />
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-1 p-3 pr-8">
          <h3 className="font-bold font-oswald text-gray-900 text-sm line-clamp-1 mb-1">
            {event.title}
          </h3>
          
          <div className="space-y-1">
            <div className="flex items-center text-gray-600">
              <Clock size={12} className="mr-1.5 text-gray-400" />
              <span className="text-xs">
                {formatDate(event.event_date)} • {formatTime(event.event_date)}
              </span>
            </div>
            
            {event.venue && (
              <div className="flex items-center text-gray-600">
                <MapPin size={12} className="mr-1.5 text-gray-400" />
                <span className="text-xs line-clamp-1">{event.venue.name}</span>
              </div>
            )}

            {event.ticket_price && (
              <div className="flex items-center text-green-600">
                <DollarSign size={12} className="mr-1.5" />
                <span className="text-xs font-semibold">${event.ticket_price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Type Tag - Rotated on right side */}
        {event.event_type && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 rotate-90 origin-center">
            <div className={`${getEventTypeColor(event.event_type)} text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap`}>
              {getEventTypeAbbreviation(event.event_type)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}