-- Add some sample exceptions and GPS data, then re-enable RLS

-- Add a few sample exceptions
INSERT INTO public.exceptions (timesheet_id, exception_type, description, status, submitted_by, created_at)
SELECT 
  t.id,
  CASE (ROW_NUMBER() OVER (ORDER BY t.id)) % 4
    WHEN 0 THEN 'Overtime Request'
    WHEN 1 THEN 'Equipment Malfunction'
    WHEN 2 THEN 'Weather Delay'
    ELSE 'Safety Incident'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY t.id)) % 4
    WHEN 0 THEN 'Crew worked 2 hours of overtime due to emergency power restoration requirements.'
    WHEN 1 THEN 'Primary work truck experienced mechanical failure, delaying start by 3 hours.'
    WHEN 2 THEN 'Heavy rain prevented outdoor electrical work for safety reasons.'
    ELSE 'Minor safety incident occurred, crew completed safety protocols and resumed work.'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY t.id)) % 3
    WHEN 0 THEN 'pending'::exception_status
    WHEN 1 THEN 'approved'::exception_status
    ELSE 'denied'::exception_status
  END,
  (SELECT id FROM public.profiles WHERE role = 'supervisor' LIMIT 1),
  t.submitted_at + INTERVAL '1 hour'
FROM public.timesheets t
WHERE random() < 0.15  -- About 15% of timesheets have exceptions
LIMIT 20;

-- Add some sample GPS tracking data for recent timesheets
INSERT INTO public.gps_tracking (timesheet_id, latitude, longitude, timestamp, accuracy)
SELECT 
  t.id,
  -- Generate realistic coordinates around a central location (simulating work areas)
  40.7128 + (random() - 0.5) * 0.1,  -- NYC area with variation
  -74.0060 + (random() - 0.5) * 0.1,
  t.submitted_at - INTERVAL '8 hours' + (random() * 8) * INTERVAL '1 hour',
  5.0 + random() * 15.0  -- GPS accuracy between 5-20 meters
FROM public.timesheets t
WHERE t.date >= CURRENT_DATE - INTERVAL '3 days'
  AND random() < 0.3  -- About 30% of recent timesheets have GPS data
ORDER BY random()
LIMIT 50;

-- Re-enable RLS for security now that we have data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;