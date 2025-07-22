import React from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Music, Palette, Mic, BookOpen } from 'lucide-react'
import { supabase, type Artist } from '../lib/supabase'

interface ArtistCardProps {
  artist: Artist
}

const getArtistTypeIcon = (type: string) => {
  switch (type) {
    case 'Musician':
      return <Music size={16} />
    case 'Visual':
      return <Palette size={16} />
    case 'Performance':
      return <Mic size={16} />
    case 'Literary':
      return <BookOpen size={16} />
    default:
      return <Music size={16} />
  }
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0)

  useEffect(() => {
    fetchUpcomingEventsCount()
  }, [artist.id])

  const fetchUpcomingEventsCount = async () => {
    const { count } = await supabase
      .from('event_artists')
      .select('events!inner(start_date)', { count: 'exact', head: true })
      .eq('artist_id', artist.id)
      .gte('events.start_date', new Date().toISOString())

    setUpcomingEventsCount(count || 0)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Artist Image */}
      <Link to={`/artists/${artist.slug}`} className="block">
        <div className="aspect-square bg-gray-200 overflow-hidden">
          {artist.image_url ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
              {getArtistTypeIcon(artist.artist_type || 'Musician')}
            </div>
          )}
        </div>
      </Link>

      {/* Artist Info */}
      <div className="p-4">
        <Link to={`/artists/${artist.slug}`} className="block">
          <h3 className="font-oswald text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
            {artist.name}
          </h3>
        </Link>

        {/* Artist Type */}
        {artist.artist_type && (
          <div className="flex items-center space-x-2 mb-2">
            {getArtistTypeIcon(artist.artist_type)}
            <span className="text-sm text-gray-600">{artist.artist_type}</span>
          </div>
        )}

        {/* Genres/Mediums */}
        {artist.musical_genres && artist.musical_genres.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {artist.musical_genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
              {artist.musical_genres.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{artist.musical_genres.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {artist.visual_mediums && artist.visual_mediums.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {artist.visual_mediums.slice(0, 2).map((medium) => (
                <span
                  key={medium}
                  className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                >
                  {medium}
                </span>
              ))}
              {artist.visual_mediums.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{artist.visual_mediums.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Events Count */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>
            {upcomingEventsCount} upcoming event{upcomingEventsCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}