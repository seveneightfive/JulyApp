/*
  # Add Artist Features and Works Table

  1. New Tables
    - `works` - Artwork/works table with image, title, medium, size, price, etc.
    
  2. Artist Table Updates
    - Add audio_file_url and audio_title for musicians
    - Add video_url and video_title for all artists
    
  3. Security
    - Enable RLS on works table
    - Add policies for authenticated users to manage their works
    - Add policies for public viewing of works
    
  4. Indexes
    - Add indexes for efficient querying of works by artist and user
*/

-- Add new fields to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS audio_file_url text,
ADD COLUMN IF NOT EXISTS audio_title text,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS video_title text,
ADD COLUMN IF NOT EXISTS purchase_link text;

-- Create works table
CREATE TABLE IF NOT EXISTS works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  medium text,
  size text,
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE,
  price numeric(10,2),
  about text,
  location text,
  exhibit text,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_for_sale boolean DEFAULT false,
  is_in_collection boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- RLS Policies for works
CREATE POLICY "Works are viewable by everyone"
  ON works
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create works"
  ON works
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own works"
  ON works
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own works"
  ON works
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_works_artist ON works(artist_id);
CREATE INDEX IF NOT EXISTS idx_works_user ON works(user_id);
CREATE INDEX IF NOT EXISTS idx_works_event ON works(event_id);
CREATE INDEX IF NOT EXISTS idx_works_venue ON works(venue_id);
CREATE INDEX IF NOT EXISTS idx_works_collection ON works(is_in_collection);
CREATE INDEX IF NOT EXISTS idx_works_for_sale ON works(is_for_sale);