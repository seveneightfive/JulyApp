import React from 'react'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Event } from '../lib/supabase'

interface EventCardProps {
  event: Event
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const featuredArtists = event.event_artists?.filter(ea => ea.is_featured) || []
  const otherArtists = event.event_artists?.filter(ea => !ea.is_featured) || []
  const allArtists = [...featuredArtists, ...otherArtists]

  return (
    <Link 
      to={`/events/${event.slug}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      {/* Event Image - 16:9 aspect ratio */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {new Date(event.start_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {new Date(event.start_date + 'T12:00:00').getDate()}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4">
        {/* Event Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors font-['Oswald']">
          {event.title}
        </h3>

        {/* Date and Time */}
        {event.event_start_time && (
          <div className="flex items-center text-gray-600 mb-2">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {event.event_start_time}
            </span>
          </div>
        )}

        {/* Venue */}
        {event.venue && (
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{event.venue.name}</span>
          </div>
        )}

        {/* Artists */}
        {allArtists.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {allArtists.slice(0, 3).map((eventArtist, index) => (
                <span
                  key={eventArtist.artist.id}
                  className={`text-xs px-2 py-1 rounded-full ${
                    eventArtist.is_featured
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {eventArtist.artist.name}
                </span>
              ))}
              {allArtists.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  +{allArtists.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Ticket Price */}
        {event.ticket_price && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">From</span>
            <span className="font-semibold text-green-600">
              ${parseFloat(event.ticket_price.toString()).toFixed(0)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}