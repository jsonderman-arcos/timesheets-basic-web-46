-- Fix the shift_time_entry_dates function to include WHERE clauses
CREATE OR REPLACE FUNCTION public.shift_time_entry_dates(days_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update time_entries dates
  UPDATE time_entries
  SET date = date + (days_to_add || ' days')::interval
  WHERE true;
  
  -- Update created_at timestamps to maintain relative ordering
  UPDATE time_entries
  SET created_at = created_at + (days_to_add || ' days')::interval
  WHERE true;
  
  -- Update submitted_at timestamps if they exist
  UPDATE time_entries
  SET submitted_at = submitted_at + (days_to_add || ' days')::interval
  WHERE submitted_at IS NOT NULL;
  
  -- Update exceptions timestamps
  UPDATE exceptions
  SET created_at = created_at + (days_to_add || ' days')::interval
  WHERE true;
  
  UPDATE exceptions
  SET resolved_at = resolved_at + (days_to_add || ' days')::interval
  WHERE resolved_at IS NOT NULL;
  
  RAISE NOTICE 'Shifted all dates forward by % days', days_to_add;
END;
$$;