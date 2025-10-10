-- Fix security: Set search_path for the function to prevent SQL injection
CREATE OR REPLACE FUNCTION shift_time_entry_dates(days_to_add INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update time_entries dates
  UPDATE time_entries
  SET date = date + (days_to_add || ' days')::interval;
  
  -- Update created_at timestamps to maintain relative ordering
  UPDATE time_entries
  SET created_at = created_at + (days_to_add || ' days')::interval;
  
  -- Update submitted_at timestamps if they exist
  UPDATE time_entries
  SET submitted_at = submitted_at + (days_to_add || ' days')::interval
  WHERE submitted_at IS NOT NULL;
  
  -- Update exceptions timestamps
  UPDATE exceptions
  SET created_at = created_at + (days_to_add || ' days')::interval;
  
  UPDATE exceptions
  SET resolved_at = resolved_at + (days_to_add || ' days')::interval
  WHERE resolved_at IS NOT NULL;
  
  RAISE NOTICE 'Shifted all dates forward by % days', days_to_add;
END;
$$;