import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import type { Event } from '../lib/supabase'

type MobileEventCardProps = {
  event: Event
}

export const MobileEventCard: React.FC<MobileEventCardProps> = ({ event }) => {
  const navigate = useNavigate()

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleClick = () => {
    navigate(`/events/${event.slug}`)
  }

  const timeRange = () => {
    const startTime = formatTimeOfDay(event.event_start_time)
    const endTime = formatTimeOfDay(event.event_end_time)
    
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`
    } else if (startTime) {
      return startTime
    }
    return 'Time TBA'
  }

  const featuredArtists = event.event_artists?.filter(ea => ea.is_featured) || []
  const otherArtists = event.event_artists?.filter(ea => !ea.is_featured) || []
  const allArtists = [...featuredArtists, ...otherArtists]

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex space-x-4">
        {/* Date Badge */}
        <div className="flex-shrink-0">
          <div className="bg-blue-50 rounded-lg p-3 text-center min-w-[60px]">
            <div className="text-xs font-medium text-blue-600 uppercase">
              {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div className="text-lg font-bold text-blue-900">
              {new Date(event.event_date + 'T00:00:00').getDate()}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
            {event.title}
          </h3>
          
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center">
              <Clock size={12} className="mr-1 flex-shrink-0" />
              <span>{timeRange()}</span>
            </div>
            
            {event.venue && (
              <div className="flex items-center">
                <MapPin size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">{event.venue.name}</span>
              </div>
            )}
            
            {allArtists.length > 0 && (
              <div className="flex items-center">
                <Users size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">
                  {allArtists.slice(0, 2).map(ea => ea.artist.name).join(', ')}
                  {allArtists.length > 2 && ` +${allArtists.length - 2} more`}
                </span>
              </div>
            )}
          </div>

          {/* Event Types */}
          {event.event_types && event.event_types.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {event.event_types.slice(0, 2).map((type) => (
                <span
                  key={type}
                  className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                >
                  {type}
                </span>
              ))}
              {event.event_types.length > 2 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
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