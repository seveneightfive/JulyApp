import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { Event, trackPageView } from '../lib/supabase'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'featured' | 'compact'
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant = 'default' }) => {
  const navigate = useNavigate()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeOfDay = (timeString?: string) => {
    if (!timeString) return ''
    
    // Create a dummy date with the time to format it properly
    const dummyDate = new Date(`2000-01-01T${timeString}`)
    return dummyDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago'
    })
  }

  const handleClick = () => {
    trackPageView('event', event.id)
    navigate(`/events/${event.slug}`)
  }

  const getTimeDisplay = () => {
    const startTime = formatTimeOfDay(event.event_start_time)
    const endTime = formatTimeOfDay(event.event_end_time)
    
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`
    } else if (startTime) {
      return startTime
    }
    return 'Time TBA'
  }

  const cardClasses = variant === 'compact' 
    ? 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4'
    : variant === 'featured'
    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer p-6'
    : 'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden'

  if (variant === 'compact') {
    return (
      <div className={cardClasses} onClick={handleClick}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h3>
            <p className="text-xs text-gray-500">{formatDate(event.event_date)}</p>
            <p className="text-xs text-gray-500">{getTimeDisplay()}</p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div className={cardClasses} onClick={handleClick}>
        {event.image_url && (
          <div className="mb-4">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            {event.description && (
              <p className="text-white/90 text-sm line-clamp-2">{event.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-white/80">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{getTimeDisplay()}</span>
            </div>
          </div>

          {event.venue && (
            <div className="flex items-center space-x-1 text-sm text-white/80">
              <MapPin size={14} />
              <span>{event.venue.name}</span>
            </div>
          )}

          {event.event_artists && event.event_artists.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-white/80">
              <Users size={14} />
              <span>
                {event.event_artists.map(ea => ea.artist.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cardClasses} onClick={handleClick}>
      {event.image_url && (
        <div className="aspect-video">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
            {event.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{getTimeDisplay()}</span>
            </div>
          </div>

          {event.venue && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MapPin size={14} />
              <span>{event.venue.name}</span>
            </div>
          )}

          {event.event_artists && event.event_artists.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Users size={14} />
              <span>
                {event.event_artists.map(ea => ea.artist.name).join(', ')}
              </span>
            </div>
          )}

          {event.event_types && event.event_types.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {event.event_types.slice(0, 2).map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {type}
                </span>
              ))}
              {event.event_types.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{event.event_types.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}