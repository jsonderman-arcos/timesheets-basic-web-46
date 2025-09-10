-- Add mock GPS data to existing time entries for August and first two weeks of September
-- Using proper JSON construction to avoid syntax errors

UPDATE time_entries 
SET gps_locations = CASE 
  -- Crew 4bcd8e82-2a50-4038-a87d-e6d15239bce3 (Anthony - GTS) - Working in Atlanta area
  WHEN crew_id = '4bcd8e82-2a50-4038-a87d-e6d15239bce3' THEN
    CASE 
      WHEN EXTRACT(DOW FROM date) = 1 THEN -- Monday - More detailed tracking
        jsonb_build_array(
          jsonb_build_object('latitude', 33.7490, 'longitude', -84.3880, 'timestamp', (date || ' 08:00:00')::timestamp, 'accuracy', 5),
          jsonb_build_object('latitude', 33.7510, 'longitude', -84.3900, 'timestamp', (date || ' 09:30:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 33.7530, 'longitude', -84.3920, 'timestamp', (date || ' 11:00:00')::timestamp, 'accuracy', 3),
          jsonb_build_object('latitude', 33.7550, 'longitude', -84.3940, 'timestamp', (date || ' 12:30:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 33.7570, 'longitude', -84.3960, 'timestamp', (date || ' 14:00:00')::timestamp, 'accuracy', 5),
          jsonb_build_object('latitude', 33.7590, 'longitude', -84.3980, 'timestamp', (date || ' 15:30:00')::timestamp, 'accuracy', 3),
          jsonb_build_object('latitude', 33.7610, 'longitude', -84.4000, 'timestamp', (date || ' 17:00:00')::timestamp, 'accuracy', 4)
        )
      WHEN EXTRACT(DOW FROM date) = 2 THEN -- Tuesday
        jsonb_build_array(
          jsonb_build_object('latitude', 33.7620, 'longitude', -84.4010, 'timestamp', (date || ' 08:00:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 33.7640, 'longitude', -84.4030, 'timestamp', (date || ' 09:30:00')::timestamp, 'accuracy', 5),
          jsonb_build_object('latitude', 33.7660, 'longitude', -84.4050, 'timestamp', (date || ' 11:00:00')::timestamp, 'accuracy', 3),
          jsonb_build_object('latitude', 33.7680, 'longitude', -84.4070, 'timestamp', (date || ' 12:30:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 33.7700, 'longitude', -84.4090, 'timestamp', (date || ' 14:00:00')::timestamp, 'accuracy', 5),
          jsonb_build_object('latitude', 33.7720, 'longitude', -84.4110, 'timestamp', (date || ' 15:30:00')::timestamp, 'accuracy', 3),
          jsonb_build_object('latitude', 33.7740, 'longitude', -84.4130, 'timestamp', (date || ' 17:00:00')::timestamp, 'accuracy', 4)
        )
      ELSE -- Other days
        jsonb_build_array(
          jsonb_build_object('latitude', 33.7400, 'longitude', -84.3800, 'timestamp', (date || ' 08:00:00')::timestamp, 'accuracy', 5),
          jsonb_build_object('latitude', 33.7420, 'longitude', -84.3820, 'timestamp', (date || ' 10:00:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 33.7440, 'longitude', -84.3840, 'timestamp', (date || ' 12:00:00')::timestamp, 'accuracy', 3),
          jsonb_build_object('latitude', 33.7460, 'longitude', -84.3860, 'timestamp', (date || ' 14:00:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 33.7480, 'longitude', -84.3900, 'timestamp', (date || ' 16:00:00')::timestamp, 'accuracy', 5)
        )
    END
    
  -- Crew 2545b3ed-5ea5-42be-8662-b3a64299622a (Jacob - GTS) - Working in Dallas area  
  WHEN crew_id = '2545b3ed-5ea5-42be-8662-b3a64299622a' THEN
    CASE 
      WHEN EXTRACT(DOW FROM date) = 1 THEN -- Monday
        jsonb_build_array(
          jsonb_build_object('latitude', 32.7767, 'longitude', -96.7970, 'timestamp', (date || ' 08:00:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 32.7787, 'longitude', -96.7990, 'timestamp', (date || ' 09:30:00')::timestamp, 'accuracy', 5),
          jsonb_build_object('latitude', 32.7807, 'longitude', -96.8010, 'timestamp', (date || ' 11:00:00')::timestamp, 'accuracy', 3),
          jsonb_build_object('latitude', 32.7827, 'longitude', -96.8030, 'timestamp', (date || ' 12:30:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 32.7847, 'longitude', -96.8050, 'timestamp', (date || ' 14:00:00')::timestamp, 'accuracy', 5),
          jsonb_build_object('latitude', 32.7867, 'longitude', -96.8070, 'timestamp', (date || ' 15:30:00')::timestamp, 'accuracy', 3),
          jsonb_build_object('latitude', 32.7887, 'longitude', -96.8090, 'timestamp', (date || ' 17:00:00')::timestamp, 'accuracy', 4)
        )
      ELSE
        jsonb_build_array(
          jsonb_build_object('latitude', 32.7700, 'longitude', -96.7900, 'timestamp', (date || ' 08:00:00')::timestamp, 'accuracy', 5),
          jsonb_build_object('latitude', 32.7720, 'longitude', -96.7920, 'timestamp', (date || ' 10:00:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 32.7740, 'longitude', -96.7940, 'timestamp', (date || ' 12:00:00')::timestamp, 'accuracy', 3),
          jsonb_build_object('latitude', 32.7760, 'longitude', -96.7960, 'timestamp', (date || ' 14:00:00')::timestamp, 'accuracy', 4),
          jsonb_build_object('latitude', 32.7780, 'longitude', -96.7980, 'timestamp', (date || ' 16:00:00')::timestamp, 'accuracy', 5)
        )
    END
    
  -- Crew dc5866fc-f257-4d92-abd3-72ca7981dc11 (Gregory - PLS) - Working in Houston area
  WHEN crew_id = 'dc5866fc-f257-4d92-abd3-72ca7981dc11' THEN
    jsonb_build_array(
      jsonb_build_object('latitude', 29.7604, 'longitude', -95.3698, 'timestamp', (date || ' 08:00:00')::timestamp, 'accuracy', 4),
      jsonb_build_object('latitude', 29.7624, 'longitude', -95.3718, 'timestamp', (date || ' 09:30:00')::timestamp, 'accuracy', 5),
      jsonb_build_object('latitude', 29.7644, 'longitude', -95.3738, 'timestamp', (date || ' 11:00:00')::timestamp, 'accuracy', 3),
      jsonb_build_object('latitude', 29.7664, 'longitude', -95.3758, 'timestamp', (date || ' 12:30:00')::timestamp, 'accuracy', 4),
      jsonb_build_object('latitude', 29.7684, 'longitude', -95.3778, 'timestamp', (date || ' 14:00:00')::timestamp, 'accuracy', 5),
      jsonb_build_object('latitude', 29.7704, 'longitude', -95.3798, 'timestamp', (date || ' 15:30:00')::timestamp, 'accuracy', 3),
      jsonb_build_object('latitude', 29.7724, 'longitude', -95.3818, 'timestamp', (date || ' 17:00:00')::timestamp, 'accuracy', 4)
    )

  -- Default pattern for all other crews - Working in Miami area
  ELSE
    jsonb_build_array(
      jsonb_build_object('latitude', 25.7617, 'longitude', -80.1918, 'timestamp', (date || ' 08:00:00')::timestamp, 'accuracy', 5),
      jsonb_build_object('latitude', 25.7637, 'longitude', -80.1938, 'timestamp', (date || ' 10:00:00')::timestamp, 'accuracy', 4),
      jsonb_build_object('latitude', 25.7657, 'longitude', -80.1958, 'timestamp', (date || ' 12:00:00')::timestamp, 'accuracy', 3),
      jsonb_build_object('latitude', 25.7677, 'longitude', -80.1978, 'timestamp', (date || ' 14:00:00')::timestamp, 'accuracy', 4),
      jsonb_build_object('latitude', 25.7697, 'longitude', -80.1998, 'timestamp', (date || ' 16:00:00')::timestamp, 'accuracy', 5)
    )
END
WHERE date >= '2025-08-01' 
  AND date <= '2025-09-14'
  AND (gps_locations = '[]'::jsonb OR gps_locations IS NULL);