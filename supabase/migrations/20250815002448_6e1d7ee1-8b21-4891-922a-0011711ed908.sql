-- Add fake GPS tracking data for each timesheet
-- Hartford, CT area: ~41.7658° N, 72.6734° W
-- Boston, MA area: ~42.3601° N, 71.0589° W

-- Helper function to generate random GPS points around a center location
CREATE OR REPLACE FUNCTION generate_gps_points(
  p_timesheet_id UUID,
  p_center_lat NUMERIC,
  p_center_lng NUMERIC,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
DECLARE
  point_time TIMESTAMP WITH TIME ZONE;
  lat_offset NUMERIC;
  lng_offset NUMERIC;
  point_count INTEGER;
  i INTEGER;
  time_interval INTERVAL;
BEGIN
  -- Generate 8-15 GPS points per timesheet (every 30-60 minutes)
  point_count := 8 + (RANDOM() * 7)::INTEGER;
  time_interval := (p_end_time - p_start_time) / point_count;
  
  FOR i IN 0..point_count LOOP
    -- Calculate time for this point
    point_time := p_start_time + (time_interval * i);
    
    -- Generate random offset within ~5 mile radius
    lat_offset := (RANDOM() - 0.5) * 0.1; -- ~0.05 degrees = ~3-4 miles
    lng_offset := (RANDOM() - 0.5) * 0.1;
    
    INSERT INTO gps_tracking (
      timesheet_id,
      latitude,
      longitude,
      timestamp,
      accuracy,
      created_at
    ) VALUES (
      p_timesheet_id,
      p_center_lat + lat_offset,
      p_center_lng + lng_offset,
      point_time,
      3.0 + (RANDOM() * 7.0), -- 3-10 meter accuracy
      point_time
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate GPS data for all timesheets
DO $$
DECLARE
  timesheet_record RECORD;
  start_timestamp TIMESTAMP WITH TIME ZONE;
  end_timestamp TIMESTAMP WITH TIME ZONE;
  center_lat NUMERIC;
  center_lng NUMERIC;
BEGIN
  FOR timesheet_record IN 
    SELECT id, date, start_time, end_time, crew_id
    FROM timesheets
    ORDER BY date, start_time
  LOOP
    -- Calculate start and end timestamps
    start_timestamp := (timesheet_record.date || ' ' || timesheet_record.start_time)::TIMESTAMP WITH TIME ZONE;
    end_timestamp := (timesheet_record.date || ' ' || timesheet_record.end_time)::TIMESTAMP WITH TIME ZONE;
    
    -- Randomly assign Hartford or Boston area
    IF RANDOM() > 0.5 THEN
      -- Hartford, CT area
      center_lat := 41.7658;
      center_lng := -72.6734;
    ELSE
      -- Boston, MA area  
      center_lat := 42.3601;
      center_lng := -71.0589;
    END IF;
    
    -- Generate GPS points for this timesheet
    PERFORM generate_gps_points(
      timesheet_record.id,
      center_lat,
      center_lng,
      start_timestamp,
      end_timestamp
    );
  END LOOP;
END;
$$;

-- Clean up the helper function
DROP FUNCTION generate_gps_points(UUID, NUMERIC, NUMERIC, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);