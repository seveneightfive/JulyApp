/*
  # Add directory fields and filtering capabilities

  1. New Fields
    - Artists: `artist_type`, `musical_genres`, `visual_mediums`
    - Venues: `venue_types`, `neighborhood`
    - Events: `event_types`
  
  2. Updates
    - Add new enum types for filtering
    - Update existing tables with new fields
    - Add indexes for performance
  
  3. Data Structure
    - Support multiple genres/mediums/types using arrays
    - Single neighborhood per venue
    - Proper constraints and validation
*/

-- Create enum types for filtering
CREATE TYPE artist_type_enum AS ENUM ('Musician', 'Visual', 'Performance', 'Literary');
CREATE TYPE musical_genre_enum AS ENUM ('Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip-Hop', 'Country', 'Reggae', 'Blues', 'Folk', 'Singer-Songwriter', 'Spoken Word', 'Motown', 'Funk', 'Americana', 'Punk', 'Grunge', 'Jam Band', 'Tejano', 'Latin', 'DJ');
CREATE TYPE visual_medium_enum AS ENUM ('Photography', 'Digital', 'Conceptual', 'Fiber Arts', 'Sculpture / Clay', 'Airbrush / Street / Mural', 'Painting', 'Jewelry', 'Illustration');
CREATE TYPE venue_type_enum AS ENUM ('Art Gallery', 'Live Music', 'Bar/Tavern', 'Retail', 'Restaurant', 'Event Space', 'Brewery/Winery', 'Outdoor Space', 'Theatre', 'Studio/Class', 'Community Space', 'First Friday ArtWalk', 'Coffee Shop', 'Church', 'Experiences', 'Trades + Services');
CREATE TYPE neighborhood_enum AS ENUM ('Downtown', 'NOTO', 'North Topeka', 'Oakland', 'Westboro Mart', 'College Hill', 'Lake Shawnee', 'Golden Mile', 'A Short Drive', 'South Topeka', 'Midtown');
CREATE TYPE event_type_enum AS ENUM ('Art', 'Entertainment', 'Lifestyle', 'Local Flavor', 'Live Music', 'Party For A Cause', 'Community / Cultural', 'Shop Local');

-- Update artists table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artists' AND column_name = 'artist_type'
  ) THEN
    ALTER TABLE artists ADD COLUMN artist_type artist_type_enum DEFAULT 'Musician';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artists' AND column_name = 'musical_genres'
  ) THEN
    ALTER TABLE artists ADD COLUMN musical_genres musical_genre_enum[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artists' AND column_name = 'visual_mediums'
  ) THEN
    ALTER TABLE artists ADD COLUMN visual_mediums visual_medium_enum[] DEFAULT '{}';
  END IF;
END $$;

-- Update venues table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'venue_types'
  ) THEN
    ALTER TABLE venues ADD COLUMN venue_types venue_type_enum[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'neighborhood'
  ) THEN
    ALTER TABLE venues ADD COLUMN neighborhood neighborhood_enum;
  END IF;
END $$;

-- Update events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_types'
  ) THEN
    ALTER TABLE events ADD COLUMN event_types event_type_enum[] DEFAULT '{}';
  END IF;
END $$;

-- Add indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_artists_type ON artists(artist_type);
CREATE INDEX IF NOT EXISTS idx_artists_musical_genres ON artists USING GIN(musical_genres);
CREATE INDEX IF NOT EXISTS idx_artists_visual_mediums ON artists USING GIN(visual_mediums);
CREATE INDEX IF NOT EXISTS idx_venues_types ON venues USING GIN(venue_types);
CREATE INDEX IF NOT EXISTS idx_venues_neighborhood ON venues(neighborhood);
CREATE INDEX IF NOT EXISTS idx_events_types ON events USING GIN(event_types);