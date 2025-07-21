/*
  # Add slug fields to events, artists, and venues

  1. New Columns
    - Add `slug` field to events, artists, and venues tables
    - Make slugs unique within each table
    - Add indexes for better performance

  2. Functions
    - Create function to generate slugs from names/titles
    - Create triggers to auto-generate slugs on insert/update
*/

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Add slug columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique indexes for slugs
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_key ON events(slug);
CREATE UNIQUE INDEX IF NOT EXISTS artists_slug_key ON artists(slug);
CREATE UNIQUE INDEX IF NOT EXISTS venues_slug_key ON venues(slug);

-- Function to ensure unique slug
CREATE OR REPLACE FUNCTION ensure_unique_slug(table_name TEXT, base_slug TEXT, exclude_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 AND ($2 IS NULL OR id != $2))', table_name)
    INTO slug_exists
    USING final_slug, exclude_id;
    
    IF NOT slug_exists THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug for events
CREATE OR REPLACE FUNCTION auto_generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := ensure_unique_slug('events', generate_slug(NEW.title), NEW.id);
  ELSE
    NEW.slug := ensure_unique_slug('events', generate_slug(NEW.slug), NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug for artists
CREATE OR REPLACE FUNCTION auto_generate_artist_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := ensure_unique_slug('artists', generate_slug(NEW.name), NEW.id);
  ELSE
    NEW.slug := ensure_unique_slug('artists', generate_slug(NEW.slug), NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug for venues
CREATE OR REPLACE FUNCTION auto_generate_venue_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := ensure_unique_slug('venues', generate_slug(NEW.name), NEW.id);
  ELSE
    NEW.slug := ensure_unique_slug('venues', generate_slug(NEW.slug), NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_auto_generate_event_slug ON events;
CREATE TRIGGER trigger_auto_generate_event_slug
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_event_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_artist_slug ON artists;
CREATE TRIGGER trigger_auto_generate_artist_slug
  BEFORE INSERT OR UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_artist_slug();

DROP TRIGGER IF EXISTS trigger_auto_generate_venue_slug ON venues;
CREATE TRIGGER trigger_auto_generate_venue_slug
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_venue_slug();

-- Generate slugs for existing records
UPDATE events SET slug = ensure_unique_slug('events', generate_slug(title), id) WHERE slug IS NULL;
UPDATE artists SET slug = ensure_unique_slug('artists', generate_slug(name), id) WHERE slug IS NULL;
UPDATE venues SET slug = ensure_unique_slug('venues', generate_slug(name), id) WHERE slug IS NULL;