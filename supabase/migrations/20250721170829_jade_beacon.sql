/*
  # Add user profile and RSVP features

  1. New Tables
    - `event_rsvps` - Track user RSVPs to events
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `event_id` (uuid, references events)
      - `status` (text, RSVP status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_rsvps
CREATE POLICY "Users can manage own RSVPs"
  ON event_rsvps
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "RSVPs are viewable by everyone"
  ON event_rsvps
  FOR SELECT
  TO public
  USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON event_rsvps(status);