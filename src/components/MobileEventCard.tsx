```typescript
import React from 'react'
import { MapPin, Calendar, DollarSign, Ticket, Users, Heart, CheckCircle, XCircle } from 'lucide-react'
import { supabase, type Event, trackPageView } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

interface MobileEventCardProps {
  event: Event
}

export const MobileEventCard: React.FC<MobileEventCardProps> = ({ event }) => {
  const { user } = useAuth()
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | 'not_going' | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  const eventDate = new Date(event.event_date)
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const handleClick = () => {
    trackPageView('event', event.id)
    window.location.href = `/events/${event.slug}`
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Art': return 'bg-blue-100 text-blue-800'
      case 'Entertainment': return 'bg-purple-100 text-purple-800'
      case 'Lifestyle': return 'bg-green-100 text-green-800'
      case 'Local Flavor': return 'bg-yellow-100 text-yellow-800'
      case 'Live Music': return 'bg-red-100 text-red-800'
      case 'Party For A Cause': return 'bg-pink-100 text-pink-800'
      case 'Community / Cultural': return 'bg-indigo-100 text-indigo-800'
      case 'Shop Local': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRsvp = async (status: 'going' | 'interested' | 'not_going') => {
    if (!user || !event.id) return

    setRsvpLoading(true)
    try {
      // Check if an RSVP already exists for this user and event
      const { data: existingRsvp, error: fetchError } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', event.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw fetchError
      }

      if (existingRsvp) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('id', existingRsvp.id)
        if (updateError) throw updateError
      } else {
        // Insert new RSVP
        const { error: insertError } = await supabase
          .from('event_rsvps')
          .insert({ user_id: user.id, event_id: event.id, status })
        if (insertError) throw insertError
      }
      setRsvpStatus(status)
    } catch (error) {
      console.error('Error handling RSVP:', error)
    } finally {
      setRsvpLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex">
        <div className="w-24 h-24 flex-shrink-0 relative">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calendar size={32} className="text-white opacity-80" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-tr-lg">
            {formattedDate}
          </div>
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3
              className="font-semibold text-gray-900 text-base line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleClick}
            >
              {event.title}
            </h3>
            {event.venue && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <MapPin size={12} className="mr-1" />
                {event.venue.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Calendar size={12} className="mr-1" />
              {formattedTime}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            {event.event_types && event.event_types.length > 0 && (
              <span className={\`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_types[0])}`}>
                {event.event_types[0]}
              </span>
            )}
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRsvp(rsvpStatus === 'going' ? 'not_going' : 'going')
                }}
                disabled={rsvpLoading}
                className={\`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  rsvpStatus === 'going'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rsvpLoading ? (
                  '...'
                ) : rsvpStatus === 'going' ? (
                  <>
                    <CheckCircle size={14} />
                    <span>Going</span>
                  </>
                ) : (
                  <>
                    <Users size={14} />
                    <span>RSVP</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```