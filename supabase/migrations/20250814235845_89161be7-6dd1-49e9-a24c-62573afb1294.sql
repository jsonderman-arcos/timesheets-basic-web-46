-- Create realistic timesheet data for the last 10 days
-- Most crews (18 crews) submit every day (100% compliance)
-- Some crews (5 crews) submit 80% of the time  
-- A couple crews (2 crews) never submit timesheets

WITH date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '9 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date AS work_date
),
crew_list AS (
  SELECT 
    id as crew_id,
    name,
    ROW_NUMBER() OVER (ORDER BY id) as crew_num
  FROM public.crews
),
timesheet_data AS (
  SELECT 
    c.crew_id,
    d.work_date,
    c.crew_num,
    -- Determine if this crew should have a timesheet for this date
    CASE 
      -- 2 crews (crew numbers 24, 25) never submit (0% compliance)
      WHEN c.crew_num IN (24, 25) THEN false
      -- 5 crews (crew numbers 19-23) submit 80% of the time
      WHEN c.crew_num BETWEEN 19 AND 23 THEN 
        (ABS(EXTRACT(epoch FROM d.work_date)::integer + c.crew_num * 17) % 10) < 8
      -- Remaining 18 crews submit every day (100% compliance)
      ELSE true
    END as should_submit,
    -- Random start times between 7:00 and 8:30 AM
    ('07:00:00'::time + (EXTRACT(epoch FROM d.work_date)::integer + c.crew_num * 13) % 90 * INTERVAL '1 minute')::time as start_time,
    -- Work days are typically 8-9 hours
    8.0 + (ABS(EXTRACT(epoch FROM d.work_date)::integer + c.crew_num * 7) % 10) * 0.1 as work_hours
  FROM crew_list c
  CROSS JOIN date_series d
)
INSERT INTO public.timesheets (
  crew_id, 
  date, 
  start_time, 
  end_time, 
  total_hours, 
  work_description,
  status,
  submitted_at
)
SELECT 
  td.crew_id,
  td.work_date,
  td.start_time,
  (td.start_time + (td.work_hours || ' hours')::interval + '30 minutes'::interval)::time as end_time, -- Add 30 min break
  td.work_hours,
  CASE 
    WHEN cl.name LIKE '%PowerCorp%' THEN 
      CASE (ABS(EXTRACT(epoch FROM td.work_date)::integer + td.crew_num) % 4)
        WHEN 0 THEN 'Power line maintenance and inspection'
        WHEN 1 THEN 'Electrical substation work'
        WHEN 2 THEN 'Transformer installation and repair'
        ELSE 'Emergency power restoration'
      END
    WHEN cl.name LIKE '%GasWorks%' THEN
      CASE (ABS(EXTRACT(epoch FROM td.work_date)::integer + td.crew_num) % 4)
        WHEN 0 THEN 'Gas pipeline inspection and maintenance'
        WHEN 1 THEN 'Meter reading and installation'
        WHEN 2 THEN 'Gas leak detection and repair'
        ELSE 'Service line installation'
      END
    WHEN cl.name LIKE '%AquaTech%' THEN
      CASE (ABS(EXTRACT(epoch FROM td.work_date)::integer + td.crew_num) % 4)
        WHEN 0 THEN 'Water main maintenance and repair'
        WHEN 1 THEN 'Hydrant testing and maintenance'
        WHEN 2 THEN 'Valve operation and inspection'
        ELSE 'Service line installation and repair'
      END
    WHEN cl.name LIKE '%ElectriCo%' THEN
      CASE (ABS(EXTRACT(epoch FROM td.work_date)::integer + td.crew_num) % 4)
        WHEN 0 THEN 'Overhead line construction'
        WHEN 1 THEN 'Underground cable installation'
        WHEN 2 THEN 'Street lighting maintenance'
        ELSE 'Customer service connections'
      END
    ELSE
      CASE (ABS(EXTRACT(epoch FROM td.work_date)::integer + td.crew_num) % 4)
        WHEN 0 THEN 'Multi-utility infrastructure inspection'
        WHEN 1 THEN 'Emergency response and repairs'
        WHEN 2 THEN 'Preventive maintenance operations'
        ELSE 'Customer service and installations'
      END
  END as work_description,
  CASE 
    WHEN (ABS(EXTRACT(epoch FROM td.work_date)::integer + td.crew_num) % 10) < 8 THEN 'approved'
    WHEN (ABS(EXTRACT(epoch FROM td.work_date)::integer + td.crew_num) % 10) < 9 THEN 'submitted'
    ELSE 'rejected'
  END as status,
  td.work_date + INTERVAL '18 hours' + 
    (ABS(EXTRACT(epoch FROM td.work_date)::integer + td.crew_num * 11) % 180) * INTERVAL '1 minute' as submitted_at
FROM timesheet_data td
JOIN crew_list cl ON cl.crew_id = td.crew_id
WHERE td.should_submit = true;