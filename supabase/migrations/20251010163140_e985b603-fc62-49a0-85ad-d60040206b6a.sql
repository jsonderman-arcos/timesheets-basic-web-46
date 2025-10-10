-- Create function to shift time entry dates forward
CREATE OR REPLACE FUNCTION shift_time_entry_dates(days_to_add INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every Monday at 1 AM
SELECT cron.schedule(
  'refresh-demo-data-weekly',
  '0 1 * * 1', -- Every Monday at 1 AM
  $$
  SELECT net.http_post(
    url:='https://sgkomeuwuomcjfxwhydk.supabase.co/functions/v1/refresh-demo-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNna29tZXV3dW9tY2pmeHdoeWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODc4NzcsImV4cCI6MjA3MTI2Mzg3N30.BcmbjUupI08k2skLMiH0cYsZcsAYJG6b1odJXLUeNUM"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);