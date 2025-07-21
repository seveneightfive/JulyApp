import React from 'react'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { Event, trackPageView } from '../lib/supabase'

interface EventCardProps {
  event: Event
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const handleClick = () => {
    trackPageView('event', event.id);
    window.location.href = `/events/${event.slug}`;
  };

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
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      {/* Event Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white" />
          </div>
        )}
        
        {/* Event Types */}
        {event.event_types && event.event_types.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_types[0])}`}>
              {event.event_types[0]}
            </span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        
        {/* Date and Time */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formatDate(event.event_date)}</span>
          <Clock className="w-4 h-4 ml-3 mr-2" />
          <span>{formatTime(event.event_date)}</span>
        </div>

        {/* Venue */}
        {event.venue && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="truncate">{event.venue.name}</span>
          </div>
        )}

        {/* Artists */}
        {event.event_artists && event.event_artists.length > 0 && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Users className="w-4 h-4 mr-2" />
            <span className="truncate">
              {event.event_artists.map(ea => ea.artist.name).join(', ')}
            </span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Ticket Price */}
        {event.ticket_price && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-medium text-green-600">
              ${event.ticket_price}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};