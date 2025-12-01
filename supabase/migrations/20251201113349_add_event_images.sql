/*
  # Add Image Support to Events

  ## Changes
  1. Add image_url column to events table for event photos
  2. Add default placeholder image support

  ## Notes
  - image_url will store URLs to event photos
  - Can be null for events without images
*/

-- Add image_url column to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE events ADD COLUMN image_url text;
  END IF;
END $$;