-- Update work type hours to be in 0.5 hour increments
UPDATE time_entries 
SET 
  working_hours = ROUND(working_hours * 2) / 2,
  standby_hours = ROUND(standby_hours * 2) / 2,
  traveling_hours = ROUND(traveling_hours * 2) / 2
WHERE working_hours IS NOT NULL 
   OR standby_hours IS NOT NULL 
   OR traveling_hours IS NOT NULL;