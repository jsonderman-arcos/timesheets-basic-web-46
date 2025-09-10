-- Insert sample exception data with realistic schedule deviation scenarios

-- First, get some existing time entry IDs to reference
-- We'll create exceptions for various scenarios

INSERT INTO exceptions (
  id,
  description,
  reason,
  flagged_by,
  status,
  time_entry_id,
  resolved_by,
  resolved_at,
  admin_notes,
  created_at
) VALUES
-- Approved exceptions
(
  gen_random_uuid(),
  'Team member worked 4 hours instead of scheduled 8 hours',
  'Team member John Smith called in sick with flu symptoms',
  'Crew Supervisor Mike Johnson',
  'approved',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 0),
  (SELECT id FROM users WHERE role = 'utility' LIMIT 1),
  NOW() - INTERVAL '2 days',
  'Approved - Valid sick leave with proper documentation',
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  'Crew worked 10 hours instead of scheduled 8 hours',
  'Equipment malfunction required extended repair time to complete safety inspection',
  'Site Foreman Sarah Wilson',
  'approved',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 1),
  (SELECT id FROM users WHERE role = 'utility' LIMIT 1),
  NOW() - INTERVAL '1 day',
  'Approved - Safety critical work, overtime justified',
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  'Team started 2 hours late (10 AM instead of 8 AM)',
  'Heavy traffic due to major highway accident caused significant delays',
  'Crew Lead David Chen',
  'approved',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 2),
  (SELECT id FROM users WHERE role = 'utility' LIMIT 1),
  NOW() - INTERVAL '3 hours',
  'Approved - Documented traffic incident, unavoidable delay',
  NOW() - INTERVAL '1 day'
),

-- Pending exceptions
(
  gen_random_uuid(),
  'Team member worked 6 hours instead of scheduled 8 hours',
  'Maria Rodriguez had to leave early for family emergency',
  'Crew Supervisor Tom Anderson',
  'submitted',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 3),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '6 hours'
),
(
  gen_random_uuid(),
  'Entire crew worked 12 hours instead of scheduled 8 hours',
  'Severe weather damage required emergency power restoration work',
  'Site Manager Lisa Parker',
  'submitted',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 4),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '4 hours'
),
(
  gen_random_uuid(),
  'Team worked split shift instead of continuous 8-hour shift',
  'Equipment breakdown at 2 PM, crew had to wait 3 hours for replacement parts',
  'Lead Technician Robert Kim',
  'submitted',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 5),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  'Two team members worked 0 hours (no show)',
  'Carlos Martinez and Alex Thompson did not report to work site, no communication received',
  'Crew Supervisor Jennifer Lee',
  'submitted',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 6),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '8 hours'
),

-- More approved exceptions
(
  gen_random_uuid(),
  'Team finished 3 hours early (5 hours worked instead of 8)',
  'Work site became unsafe due to gas leak, emergency evacuation ordered by fire department',
  'Safety Officer Mark Rodriguez',
  'approved',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 7),
  (SELECT id FROM users WHERE role = 'utility' LIMIT 1),
  NOW() - INTERVAL '4 days',
  'Approved - Safety evacuation, proper protocol followed',
  NOW() - INTERVAL '6 days'
),
(
  gen_random_uuid(),
  'Team worked 9 hours instead of scheduled 8 hours',
  'Vehicle breakdown required crew to wait for replacement transportation',
  'Fleet Coordinator Amanda White',
  'approved',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 8),
  (SELECT id FROM users WHERE role = 'utility' LIMIT 1),
  NOW() - INTERVAL '5 hours',
  'Approved - Fleet maintenance issue, documented mechanical failure',
  NOW() - INTERVAL '2 days'
),

-- More pending exceptions  
(
  gen_random_uuid(),
  'Team member worked different hours (12 PM - 8 PM instead of 8 AM - 4 PM)',
  'Kevin Johnson requested schedule change for medical appointment',
  'Shift Supervisor Rachel Green',
  'submitted',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 9),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  'Crew worked 6 hours instead of scheduled 8 hours',
  'Permit issues at job site, city inspector delayed approval until afternoon',
  'Project Manager Steve Davis',
  'submitted',
  (SELECT id FROM time_entries LIMIT 1 OFFSET 10),
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '30 minutes'
)