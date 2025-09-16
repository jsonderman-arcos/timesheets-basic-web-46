-- Clear all GPS coordinate data from time_entries table
UPDATE time_entries 
SET 
  gps_locations = '[]'::jsonb,
  location = ''
WHERE 
  gps_locations IS NOT NULL 
  OR location IS NOT NULL;