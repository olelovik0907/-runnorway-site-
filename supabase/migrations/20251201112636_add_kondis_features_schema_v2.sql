/*
  # Add Kondis-inspired Features Schema

  ## Overview
  This migration adds comprehensive features inspired by Kondis.no including:
  - News/articles system
  - Statistics and rankings
  - Training programs and resources
  - Race ratings and reviews
  - Multiple sport categories
  - Blog functionality

  ## New Tables

  ### 1. `sport_categories`
  - `id` (uuid, primary key)
  - `name` (text, unique) - running, ultra, cross_country, cycling, orienteering, multisport
  - `display_name` (text)
  - `description` (text)
  - `icon` (text)
  - `active` (boolean)

  ### 2. `articles`
  Content management for news, training advice, interviews, etc.
  - `id` (uuid, primary key)
  - `title` (text) - Article headline
  - `slug` (text, unique) - URL-friendly identifier
  - `content` (text) - Full article content
  - `excerpt` (text) - Short summary
  - `author_id` (uuid) - References profiles
  - `category` (text) - news, training, nutrition, injury, interview, race_report, review, etc.
  - `sport_type` (text) - References sport_categories
  - `featured_image_url` (text)
  - `published_at` (timestamptz)
  - `view_count` (int) - Track popularity
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `training_programs`
  Structured training plans
  - `id` (uuid, primary key)
  - `title` (text) - Program name
  - `description` (text)
  - `sport_type` (text)
  - `difficulty_level` (text) - beginner, intermediate, advanced
  - `duration_weeks` (int)
  - `goal_distance` (text) - 5K, 10K, Half Marathon, Marathon, etc.
  - `author_id` (uuid)
  - `content` (jsonb) - Weekly structure
  - `created_at`, `updated_at` (timestamptz)

  ### 4. `race_ratings`
  User reviews and ratings for races
  - `id` (uuid, primary key)
  - `event_id` (uuid) - References events
  - `user_id` (uuid) - References profiles
  - `rating` (int) - 1-5 stars
  - `organization_rating`, `course_rating`, `atmosphere_rating`, `value_rating` (int)
  - `review_text` (text)
  - `would_recommend` (boolean)
  - `created_at`, `updated_at` (timestamptz)

  ### 5. `runner_statistics`
  Track and rank runner performance
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `year` (int)
  - `total_races`, `total_distance_km` (int/numeric)
  - `best_5k_time`, `best_10k_time`, `best_half_marathon_time`, `best_marathon_time` (interval)
  - `ranking_points` (numeric) - For leaderboards
  - `age_category` (text)

  ### 6. `blog_posts`
  User-generated blog content
  - `id` (uuid, primary key)
  - `author_id` (uuid) - References profiles
  - `title`, `slug`, `content`, `excerpt` (text)
  - `tags` (text[])
  - `published` (boolean)
  - `published_at` (timestamptz)
  - `view_count` (int)

  ### 7. `comments`
  Comments on articles, blog posts, and races
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `content_type` (text) - article, blog_post, event
  - `content_id` (uuid)
  - `comment_text` (text)
  - `parent_comment_id` (uuid) - For threaded comments

  ## Security
  - Enable RLS on all tables
  - Public can read published content
  - Authenticated users can create content
  - Users can only edit/delete their own content
*/

-- Create sport_categories table first
CREATE TABLE IF NOT EXISTS sport_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sport_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sport categories"
  ON sport_categories FOR SELECT
  USING (active = true);

-- Insert default sport categories first (before creating foreign keys)
INSERT INTO sport_categories (name, display_name, description) VALUES
  ('running', 'Løp', 'Tradisjonelle løp på vei og terreng'),
  ('ultra', 'Ultraløp', 'Løp over marathon-distansen'),
  ('cross_country', 'Langrenn', 'Skiløping på langrennsski'),
  ('cycling', 'Sykkel', 'Sykkelritt og sykkelløp'),
  ('orienteering', 'Orientering', 'Terrengløp med navigasjon'),
  ('multisport', 'Multisport', 'Triatlon og andre kombinasjonsidretter')
ON CONFLICT (name) DO NOTHING;

-- Add sport_type to events table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'sport_type'
  ) THEN
    ALTER TABLE events ADD COLUMN sport_type text DEFAULT 'running' REFERENCES sport_categories(name);
  END IF;
END $$;

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category text NOT NULL,
  sport_type text REFERENCES sport_categories(name),
  featured_image_url text,
  published_at timestamptz,
  view_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "Authors can create articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own articles"
  ON articles FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create training_programs table
CREATE TABLE IF NOT EXISTS training_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  sport_type text REFERENCES sport_categories(name),
  difficulty_level text NOT NULL,
  duration_weeks int NOT NULL,
  goal_distance text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content jsonb NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published training programs"
  ON training_programs FOR SELECT
  USING (published = true);

CREATE POLICY "Authors can create training programs"
  ON training_programs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own training programs"
  ON training_programs FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Create race_ratings table
CREATE TABLE IF NOT EXISTS race_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  organization_rating int CHECK (organization_rating >= 1 AND organization_rating <= 5),
  course_rating int CHECK (course_rating >= 1 AND course_rating <= 5),
  atmosphere_rating int CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
  value_rating int CHECK (value_rating >= 1 AND value_rating <= 5),
  review_text text,
  would_recommend boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE race_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view race ratings"
  ON race_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create race ratings"
  ON race_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON race_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON race_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create runner_statistics table
CREATE TABLE IF NOT EXISTS runner_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  year int NOT NULL,
  total_races int DEFAULT 0,
  total_distance_km numeric DEFAULT 0,
  best_5k_time interval,
  best_10k_time interval,
  best_half_marathon_time interval,
  best_marathon_time interval,
  ranking_points numeric DEFAULT 0,
  age_category text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year)
);

ALTER TABLE runner_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view runner statistics"
  ON runner_statistics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own statistics"
  ON runner_statistics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert statistics"
  ON runner_statistics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  tags text[],
  published boolean DEFAULT false,
  published_at timestamptz,
  view_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Authors can view own unpublished posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  comment_text text NOT NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_sport_type ON articles(sport_type);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_race_ratings_event ON race_ratings(event_id);
CREATE INDEX IF NOT EXISTS idx_race_ratings_user ON race_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_runner_statistics_user ON runner_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_runner_statistics_year ON runner_statistics(year);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);