-- Add mock GPS data for all crews starting September 1, 2025
-- This creates realistic GPS coordinates around Boston for utility work crews

WITH crew_gps_data AS (
  SELECT 
    te.id as time_entry_id,
    te.crew_id,
    te.date,
    -- Generate between 8-15 GPS points per time entry
    floor(random() * 8 + 8)::int as num_points
  FROM time_entries te
  WHERE te.date >= '2025-09-01'
    AND (te.gps_locations IS NULL OR te.gps_locations = '[]'::jsonb)
),
boston_areas AS (
  -- Different Boston area coordinates for variety
  SELECT * FROM (VALUES
    -- Downtown Boston
    (42.3601, -71.0589, 'Downtown'),
    (42.3584, -71.0636, 'Financial District'),
    (42.3505, -71.0763, 'Beacon Hill'),
    
    -- Cambridge
    (42.3736, -71.1097, 'Cambridge'),
    (42.3770, -71.1167, 'Harvard Square'),
    (42.3626, -71.0843, 'MIT Area'),
    
    -- South Boston
    (42.3320, -71.0412, 'South Boston'),
    (42.3439, -71.0331, 'Seaport'),
    (42.3370, -71.0275, 'East Boston'),
    
    -- Back Bay/Fenway
    (42.3505, -71.0748, 'Back Bay'),
    (42.3467, -71.0972, 'Fenway'),
    (42.3398, -71.0892, 'South End'),
    
    -- North Boston
    (42.3662, -71.0621, 'North End'),
    (42.3875, -71.0995, 'Somerville'),
    (42.4184, -71.1061, 'Medford'),
    
    -- West Boston
    (42.3417, -71.1527, 'Brighton'),
    (42.3555, -71.1685, 'Newton'),
    (42.3601, -71.1978, 'Waltham'),
    
    -- Suburbs
    (42.2528, -71.0023, 'Quincy'),
    (42.4072, -71.1190, 'Arlington'),
    (42.4430, -71.1236, 'Winchester')
  ) AS areas(lat, lng, area_name)
),
gps_points AS (
  SELECT 
    cgd.time_entry_id,
    cgd.crew_id,
    cgd.date,
    -- Select a base area for each crew/date combination
    ba.lat + (random() - 0.5) * 0.02 as base_lat,
    ba.lng + (random() - 0.5) * 0.02 as base_lng,
    generate_series(1, cgd.num_points) as point_num,
    cgd.num_points
  FROM crew_gps_data cgd
  CROSS JOIN LATERAL (
    SELECT lat, lng, area_name 
    FROM boston_areas 
    ORDER BY random() 
    LIMIT 1
  ) ba
),
formatted_gps AS (
  SELECT 
    time_entry_id,
    jsonb_agg(
      jsonb_build_object(
        'latitude', 
        base_lat + (random() - 0.5) * 0.008, -- ~0.4 mile radius variation
        'longitude', 
        base_lng + (random() - 0.5) * 0.008, -- ~0.4 mile radius variation
        'timestamp', 
        extract(epoch from (date::timestamp + (point_num * interval '30 minutes'))) * 1000,
        'accuracy', 
        floor(random() * 10 + 5)::int -- 5-15 meter accuracy
      )
      ORDER BY point_num
    ) as gps_locations
  FROM gps_points
  GROUP BY time_entry_id
)
UPDATE time_entries 
SET gps_locations = fg.gps_locations
FROM formatted_gps fg
WHERE time_entries.id = fg.time_entry_id;