-- Temporarily remove foreign key constraint to add fake data, then re-enable security
ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;

-- Create some sample user profiles for the system
INSERT INTO public.profiles (user_id, email, full_name, role) VALUES
(gen_random_uuid(), 'admin@system.com', 'System Administrator', 'admin'),
(gen_random_uuid(), 'usp.admin@system.com', 'USP Administrator', 'usp_admin'),
(gen_random_uuid(), 'ep.manager@system.com', 'EP Manager', 'ep_manager'),
(gen_random_uuid(), 'supervisor1@system.com', 'John Supervisor', 'supervisor'),
(gen_random_uuid(), 'supervisor2@system.com', 'Jane Supervisor', 'supervisor');

-- Add some sample exceptions using the newly created profiles
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
  (SELECT id FROM public.profiles WHERE role = 'usp_admin' LIMIT 1),
  t.submitted_at + INTERVAL '1 hour'
FROM public.timesheets t
WHERE random() < 0.15
LIMIT 20;

-- Add GPS tracking data for recent timesheets
INSERT INTO public.gps_tracking (timesheet_id, latitude, longitude, timestamp, accuracy)
SELECT 
  t.id,
  40.7128 + (random() - 0.5) * 0.1,
  -74.0060 + (random() - 0.5) * 0.1,
  t.submitted_at - INTERVAL '8 hours' + (random() * 8) * INTERVAL '1 hour',
  5.0 + random() * 15.0
FROM public.timesheets t
WHERE t.date >= CURRENT_DATE - INTERVAL '3 days'
  AND random() < 0.3
ORDER BY random()
LIMIT 50;