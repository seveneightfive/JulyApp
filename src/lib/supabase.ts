import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Types
export interface Profile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  bio?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface Venue {
  id: string
  slug: string
  name: string
  description?: string
  address: string
  city: string
  state?: string
  country: string
  phone?: string
  email?: string
  website?: string
  capacity?: number
  venue_type: string
  venue_types?: string[]
  neighborhood?: string
  image_url?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Artist {
  id: string
  slug: string
  name: string
  tagline?: string
  bio?: string
  genre?: string
  artist_type: 'Musician' | 'Visual' | 'Performance' | 'Literary'
  musical_genres?: string[]
  visual_mediums?: string[]
  website?: string
  avatar_url?: string
  artist_website?: string
  social_facebook?: string
  artist_spotify?: string
  artist_youtube?: string
  artist_email?: string
  social_links?: Record<string, string>
  image_url?: string
  verified: boolean
  audio_file_url?: string
  audio_title?: string
  video_url?: string
  video_title?: string
  purchase_link?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Work {
  id: string
  title: string
  image_url?: string
  medium?: string
  size?: string
  artist_id: string
  price?: number
  about?: string
  location?: string
  exhibit?: string
  event_id?: string
  venue_id?: string
  user_id: string
  is_for_sale: boolean
  is_in_collection: boolean
  created_at: string
  updated_at: string
  artist?: Artist
  user?: Profile
}

export interface Event {
  id: string
  slug: string
  title: string
  description?: string
  event_date: string
  end_date?: string
  venue_id?: string
  ticket_price?: number
  ticket_url?: string
  image_url?: string
  event_type: string
  event_types?: string[]
  capacity?: number
  created_by?: string
  created_at: string
  updated_at: string
  venue?: Venue
  artists?: Artist[]
  event_artists?: { artist: Artist; is_featured: boolean }[]
}

export interface Review {
  id: string
  user_id: string
  entity_type: 'event' | 'artist' | 'venue'
  entity_id: string
  rating: number
  title?: string
  content?: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Follow {
  id: string
  follower_id: string
  entity_type: 'artist' | 'venue' | 'user'
  entity_id: string
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  entity_type?: 'event' | 'artist' | 'venue' | 'user'
  entity_id?: string
  priority: number
  active: boolean
  expires_at?: string
  created_by?: string
  created_at: string
}

export interface PageView {
  id: string
  page_type: string
  page_id?: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  created_at: string
}

export interface EventRSVP {
  id: string
  user_id: string
  event_id: string
  status: 'going' | 'interested' | 'not_going'
  created_at: string
  profile?: Profile
}

// Helper functions
export const trackPageView = async (pageType: string, pageId?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  await supabase.from('page_views').insert({
    page_type: pageType,
    page_id: pageId,
    user_id: user?.id,
    user_agent: navigator.userAgent,
    referrer: document.referrer
  })
}