/*
  # Add Social and Participant Tracking Features

  ## Overview
  This migration adds social features and participant tracking inspired by racedays.run:
  - Track who is interested in events
  - Track who is registered/planning to attend
  - User following system
  - Event sharing and social engagement
  - Enhanced event metadata

  ## New Tables

  ### 1. event_interest
  Tracks users who are interested in events (not yet registered)
  - id (uuid, primary key)
  - user_id (uuid) - References auth.users
  - event_id (uuid) - References events
  - created_at (timestamptz)

  ### 2. user_follows
  User following system for social connections
  - id (uuid, primary key)
  - follower_id (uuid) - User who is following
  - following_id (uuid) - User being followed
  - created_at (timestamptz)

  ### 3. event_shares
  Track event sharing activity
  - id (uuid, primary key)
  - user_id (uuid) - User who shared
  - event_id (uuid) - Event being shared
  - platform (text) - facebook, twitter, email, etc.
  - created_at (timestamptz)

  ## Table Modifications

  ### Updates to events
  - Add tags (text[]) - Searchable tags for events
  - Add featured (boolean) - Mark featured/highlighted events
  - Add registration_count (int) - Cached count of registrations

  ### Updates to profiles
  - Add public_profile (boolean) - Control profile visibility
  - Add show_race_history (boolean) - Control race history visibility
  - Add follower_count (int) - Cached follower count
  - Add following_count (int) - Cached following count

  ## Security
  - Enable RLS on all new tables
  - Users can see interested/registered participants
  - Users control their own privacy settings
  - Public profiles are visible to all authenticated users
*/

-- Create event_interest table
CREATE TABLE IF NOT EXISTS event_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE event_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event interest"
  ON event_interest FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can mark interest in events"
  ON event_interest FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own interest"
  ON event_interest FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create event_shares table
CREATE TABLE IF NOT EXISTS event_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event shares"
  ON event_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can share events"
  ON event_shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add columns to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'tags'
  ) THEN
    ALTER TABLE events ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'featured'
  ) THEN
    ALTER TABLE events ADD COLUMN featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'registration_count'
  ) THEN
    ALTER TABLE events ADD COLUMN registration_count int DEFAULT 0;
  END IF;
END $$;

-- Add columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'public_profile'
  ) THEN
    ALTER TABLE profiles ADD COLUMN public_profile boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'show_race_history'
  ) THEN
    ALTER TABLE profiles ADD COLUMN show_race_history boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'follower_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN follower_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'following_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN following_count int DEFAULT 0;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_interest_user ON event_interest(user_id);
CREATE INDEX IF NOT EXISTS idx_event_interest_event ON event_interest(event_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_event_shares_event ON event_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured) WHERE featured = true;