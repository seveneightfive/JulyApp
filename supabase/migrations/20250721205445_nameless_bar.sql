/*
  # Update venues table with default city and state

  1. Changes
    - Set default city to 'Topeka'
    - Set default state to 'Kansas'
    - Add 'West Topeka' to neighborhood enum
*/

-- Add 'West Topeka' to the neighborhood enum
ALTER TYPE neighborhood_enum ADD VALUE 'West Topeka';

-- Update existing venues without city/state to have defaults
UPDATE venues 
SET 
  city = COALESCE(NULLIF(city, ''), 'Topeka'),
  state = COALESCE(NULLIF(state, ''), 'Kansas')
WHERE city IS NULL OR city = '' OR state IS NULL OR state = '';

-- Set default values for future inserts
ALTER TABLE venues 
ALTER COLUMN city SET DEFAULT 'Topeka',
ALTER COLUMN state SET DEFAULT 'Kansas';