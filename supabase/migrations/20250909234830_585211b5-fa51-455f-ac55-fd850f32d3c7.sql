-- Update existing time entries with realistic work type hour distributions
UPDATE time_entries 
SET 
  working_hours = CASE 
    -- 80% of entries should be primarily working hours
    WHEN random() < 0.8 THEN 
      GREATEST(0, (hours_regular + hours_overtime) * (0.7 + random() * 0.25))
    -- 15% should be primarily standby
    WHEN random() < 0.95 THEN 
      GREATEST(0, (hours_regular + hours_overtime) * (0.1 + random() * 0.3))
    -- 5% should be primarily traveling  
    ELSE 
      GREATEST(0, (hours_regular + hours_overtime) * (0.1 + random() * 0.2))
  END,
  
  standby_hours = CASE 
    -- 80% of entries should have minimal standby
    WHEN random() < 0.8 THEN 
      GREATEST(0, (hours_regular + hours_overtime) * (random() * 0.2))
    -- 15% should be primarily standby
    WHEN random() < 0.95 THEN 
      GREATEST(0, (hours_regular + hours_overtime) * (0.5 + random() * 0.4))
    -- 5% should have some standby
    ELSE 
      GREATEST(0, (hours_regular + hours_overtime) * (0.2 + random() * 0.3))
  END,
  
  traveling_hours = CASE 
    -- 80% of entries should have minimal traveling
    WHEN random() < 0.8 THEN 
      GREATEST(0, (hours_regular + hours_overtime) * (random() * 0.15))
    -- 15% should have some traveling
    WHEN random() < 0.95 THEN 
      GREATEST(0, (hours_regular + hours_overtime) * (random() * 0.3))
    -- 5% should be primarily traveling
    ELSE 
      GREATEST(0, (hours_regular + hours_overtime) * (0.6 + random() * 0.3))
  END

WHERE (hours_regular + hours_overtime) > 0;

-- Normalize the hours to ensure they add up to the original total
-- This second update ensures the three work type hours sum to the original total
WITH normalized_hours AS (
  SELECT 
    id,
    (hours_regular + hours_overtime) as total_hours,
    working_hours + standby_hours + traveling_hours as current_sum,
    working_hours,
    standby_hours, 
    traveling_hours
  FROM time_entries 
  WHERE (hours_regular + hours_overtime) > 0
)
UPDATE time_entries 
SET 
  working_hours = ROUND((nh.working_hours / NULLIF(nh.current_sum, 0)) * nh.total_hours, 2),
  standby_hours = ROUND((nh.standby_hours / NULLIF(nh.current_sum, 0)) * nh.total_hours, 2),
  traveling_hours = ROUND((nh.traveling_hours / NULLIF(nh.current_sum, 0)) * nh.total_hours, 2)
FROM normalized_hours nh
WHERE time_entries.id = nh.id AND nh.current_sum > 0;