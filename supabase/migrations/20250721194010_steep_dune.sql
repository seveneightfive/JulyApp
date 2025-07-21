/*
  # Add tagline, avatar, and social media fields to artists table

  1. New Fields
    - `tagline` (text) - Short tagline/description for the artist
    - `avatar_url` (text) - Profile picture/avatar URL
    - `artist_website` (text) - Artist's main website
    - `social_facebook` (text) - Facebook page URL
    - `artist_spotify` (text) - Spotify artist page URL
    - `artist_youtube` (text) - YouTube channel URL
    - `artist_email` (text) - Direct email contact

  2. Changes
    - Add new columns to artists table with proper defaults
    - All fields are optional (nullable)
*/

-- Add new fields to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS artist_website text,
ADD COLUMN IF NOT EXISTS social_facebook text,
ADD COLUMN IF NOT EXISTS artist_spotify text,
ADD COLUMN IF NOT EXISTS artist_youtube text,
ADD COLUMN IF NOT EXISTS artist_email text;