/*
  # Add registration_open field to events table

  1. Changes
    - Add `registration_open` boolean column to events table
    - Default value is true (registration is open)
    - Add logic to automatically set registration_open based on registration_close_date

  2. Notes
    - This allows events to indicate whether registration is currently open or closed
    - Can be used manually or automatically based on registration_close_date
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'registration_open'
  ) THEN
    ALTER TABLE events ADD COLUMN registration_open boolean DEFAULT true;
  END IF;
END $$;

UPDATE events
SET registration_open = CASE
  WHEN registration_close_date IS NULL THEN true
  WHEN registration_close_date >= CURRENT_DATE THEN true
  ELSE false
END
WHERE registration_open IS NULL;
