/*
  # Fix page views RLS policy

  1. Security Changes
    - Update INSERT policy on `page_views` table to allow anonymous users
    - Allow both authenticated users (with matching user_id) and anonymous users (user_id IS NULL)
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert page views" ON page_views;

-- Create a new policy that allows both authenticated and anonymous page views
CREATE POLICY "Allow page view tracking for all users"
  ON page_views
  FOR INSERT
  TO public
  WITH CHECK ((user_id IS NULL) OR (auth.uid() = user_id));