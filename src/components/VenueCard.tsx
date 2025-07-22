import React, { useState, useEffect } from 'react'
import { MapPin, Calendar, Phone, Globe, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, type Venue } from '../lib/supabase'

interface VenueCardProps {
  venue: Venue
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0)

  useEffect(() => {
    fetchUpcomingEventsCount()
  }, [venue.id])

  const fetchUpcomingEventsCount = async () => {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', venue.id)
      .gte('start_date', new Date().toISOString())

    setUpcomingEventsCount(count || 0)
  }

  // Extract just the street address (first part before comma)
  const streetAddress = venue.address.split(',')[0].trim()

  return (
    <Link 
      to={`/venues/${venue.slug}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      {venue.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="font-oswald text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {venue.name}
        </h3>
        
        <div className="flex items-start space-x-2 text-gray-600 mb-3">
          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">{streetAddress}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 mb-4">
          <Calendar size={16} />
          <span className="text-sm">
            {upcomingEventsCount} upcoming event{upcomingEventsCount !== 1 ? 's' : ''}
          </span>
        </div>

        {venue.venue_types && venue.venue_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {venue.venue_types.slice(0, 3).map((type, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {type}
              </span>
            ))}
            {venue.venue_types.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{venue.venue_types.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center space-x-4 text-gray-500">
          {venue.email && (
            <div className="flex items-center space-x-1">
              <Mail size={14} />
              <span className="text-xs">Email</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}