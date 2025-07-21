/*
  # Fix Event-Artist Relationships

  1. Changes
    - Remove single artist_id from events table
    - Create event_artists junction table for many-to-many relationship
    - Add indexes for performance
    - Update RLS policies

  2. Security
    - Enable RLS on event_artists table
    - Add policies for public viewing and authenticated user management
*/

-- Remove the single artist_id column from events
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'artist_id'
  ) THEN
    ALTER TABLE events DROP COLUMN artist_id;
  END IF;
END $$;

-- Create event_artists junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS event_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, artist_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_artists_event ON event_artists(event_id);
CREATE INDEX IF NOT EXISTS idx_event_artists_artist ON event_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_event_artists_featured ON event_artists(is_featured);

-- Enable RLS
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Event artists are viewable by everyone"
  ON event_artists
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage event artists"
  ON event_artists
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);