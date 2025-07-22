import React from 'react'
import type { Event } from '../lib/supabase'

type MobileEventCardProps = {
  event: Event
}

export const MobileEventCard: React.FC<MobileEventCardProps> = ({ event }) => {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="font-bold text-lg">{event.title}</h2>
      <p className="text-gray-600">{event.venue?.name}</p>
      <p className="text-gray-500 text-sm">
        {new Date(event.event_date).toLocaleDateString()}
      </p>
    </div>
  )
}
