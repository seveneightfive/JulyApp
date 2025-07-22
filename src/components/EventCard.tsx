import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Calendar, Users } from 'lucide-react'
import { Event, trackPageView } from '../lib/supabase'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'featured' | 'compact'
}

const getEventTypeColor = (eventType: string): string => {
  const colors: Record<string, string> = {
    'Art': 'bg-pink-100 text-pink-800 border-pink-200',
    'Live Music': 'bg-blue-100 text-blue-800 border-blue-200',
    'Entertainment': 'bg-purple-100 text-purple-800 border-purple-200',
    'Lifestyle': 'bg-green-100 text-green-800 border-green-200',
    'Local Flavor': 'bg-orange-100 text-orange-800 border-orange-200',
    'Party For A Cause': 'bg-red-100 text-red-800 border-red-200',
    'Community / Cultural': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Shop Local': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  return colors[eventType] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const formatTimeOfDay = (timeString?: string): string => {
  if (!timeString) return ''
  
  try {
    const dummyDate = new Date(`2024-01-01T${timeString}`)
    return dummyDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return timeString
  }
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant = 'default' }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    trackPageView('event-detail', event.id)
    navigate(`/events/${event.slug}`)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00')
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const getTimeRange = () => {
    const startTime = formatTimeOfDay(event.event_start_time)
    const endTime = formatTimeOfDay(event.event_end_time)
    
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`
    } else if (startTime) {
      return startTime
    }
    return ''
  }

  const allArtists = event.event_artists?.map(ea => ea.artist.name) || []

  // Mobile-style horizontal layout for all variants
  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100 p-4"
    >
      <div className="flex items-center space-x-4">
        {/* Date Badge or Image */}
        <div className="flex-shrink-0">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex flex-col items-center justify-center text-white">
              <div className="text-xs font-medium">
                {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </div>
              <div className="text-lg font-bold">
                {new Date(event.event_date + 'T00:00:00').getDate()}
              </div>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          {/* Event Types */}
          {event.event_types && event.event_types.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {event.event_types.slice(0, 2).map((type) => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(type)}`}
                >
                  {type}
                </span>
              ))}
              {event.event_types.length > 2 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  +{event.event_types.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {event.title}
          </h3>

          {/* Date and Time */}
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(event.event_date)}</span>
            {getTimeRange() && (
              <>
                <Clock size={14} className="ml-3 mr-1" />
                <span>{getTimeRange()}</span>
              </>
            )}
          </div>

          {/* Venue */}
          {event.venue && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </div>
          )}

          {/* Artists */}
          {allArtists.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Users size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                {allArtists.slice(0, 2).join(', ')}
                {allArtists.length > 2 && ` +${allArtists.length - 2} more`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}