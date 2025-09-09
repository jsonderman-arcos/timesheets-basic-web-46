-- Add realistic GPS location data to time entries for Boston area crews
-- This covers August and first two weeks of September with logical street paths

-- Function to generate realistic GPS paths along Boston streets
CREATE OR REPLACE FUNCTION generate_boston_gps_path(
  start_lat DECIMAL, 
  start_lng DECIMAL, 
  work_hours DECIMAL,
  entry_date DATE
) RETURNS JSONB AS $$
DECLARE
  gps_points JSONB := '[]'::JSONB;
  current_lat DECIMAL;
  current_lng DECIMAL;
  point_count INTEGER;
  i INTEGER := 0;
  lat_increment DECIMAL;
  lng_increment DECIMAL;
  timestamp_increment INTEGER;
  base_timestamp BIGINT;
BEGIN
  -- Calculate number of GPS points based on work hours (one every 30 minutes)
  point_count := GREATEST(2, FLOOR(work_hours * 2)::INTEGER);
  
  -- Base timestamp for the date (8 AM start time)
  base_timestamp := EXTRACT(EPOCH FROM (entry_date + INTERVAL '8 hours'))::BIGINT * 1000;
  
  -- Create incremental movement along Boston streets
  current_lat := start_lat;
  current_lng := start_lng;
  
  -- Random destination within Boston area bounds
  lat_increment := (42.320 + random() * 0.080 - current_lat) / point_count;
  lng_increment := (-71.120 + random() * 0.080 - current_lng) / point_count;
  
  -- Time increment in milliseconds (spread over work duration)
  timestamp_increment := (work_hours * 3600 * 1000 / point_count)::INTEGER;
  
  WHILE i < point_count LOOP
    -- Add some randomness to simulate street patterns
    current_lat := current_lat + lat_increment + (random() - 0.5) * 0.002;
    current_lng := current_lng + lng_increment + (random() - 0.5) * 0.002;
    
    -- Ensure we stay within Boston area bounds
    current_lat := GREATEST(42.280, LEAST(42.400, current_lat));
    current_lng := GREATEST(-71.180, LEAST(-71.020, current_lng));
    
    gps_points := gps_points || jsonb_build_object(
      'latitude', ROUND(current_lat::NUMERIC, 6),
      'longitude', ROUND(current_lng::NUMERIC, 6),
      'timestamp', base_timestamp + (i * timestamp_increment),
      'accuracy', 5 + random() * 10
    );
    
    i := i + 1;
  END LOOP;
  
  RETURN gps_points;
END;
$$ LANGUAGE plpgsql;

-- Update time entries with GPS data for August and first two weeks of September
UPDATE time_entries 
SET gps_locations = generate_boston_gps_path(
  -- Start locations around Boston utility service areas
  CASE 
    WHEN (crew_id::text||date::text)::int % 5 = 0 THEN 42.3601 -- Downtown/Government Center
    WHEN (crew_id::text||date::text)::int % 5 = 1 THEN 42.3505 -- Back Bay
    WHEN (crew_id::text||date::text)::int % 5 = 2 THEN 42.3370 -- South End
    WHEN (crew_id::text||date::text)::int % 5 = 3 THEN 42.3200 -- Roxbury
    ELSE 42.3800 -- Cambridge border
  END,
  CASE 
    WHEN (crew_id::text||date::text)::int % 5 = 0 THEN -71.0589 -- Downtown/Government Center
    WHEN (crew_id::text||date::text)::int % 5 = 1 THEN -71.0749 -- Back Bay  
    WHEN (crew_id::text||date::text)::int % 5 = 2 THEN -71.0700 -- South End
    WHEN (crew_id::text||date::text)::int % 5 = 3 THEN -71.0900 -- Roxbury
    ELSE -71.1100 -- Cambridge border
  END,
  GREATEST(1, working_hours + traveling_hours + standby_hours),
  date
)
WHERE date >= '2024-08-01' 
  AND date <= '2024-09-14'
  AND (working_hours + traveling_hours + standby_hours) > 0;

-- Clean up the temporary function
DROP FUNCTION generate_boston_gps_path(DECIMAL, DECIMAL, DECIMAL, DATE);