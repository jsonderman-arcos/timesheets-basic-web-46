-- Add comprehensive fake exception data with proper UUID handling

-- Add diverse exceptions with realistic scenarios
INSERT INTO public.exceptions (timesheet_id, exception_type, description, status, submitted_by, created_at)
SELECT 
  t.id,
  -- Diverse exception types
  CASE (random() * 12)::int
    WHEN 0 THEN 'Overtime Request'
    WHEN 1 THEN 'Equipment Malfunction'
    WHEN 2 THEN 'Weather Delay'
    WHEN 3 THEN 'Safety Incident'
    WHEN 4 THEN 'Emergency Call-Out'
    WHEN 5 THEN 'Training Attendance'
    WHEN 6 THEN 'Vehicle Breakdown'
    WHEN 7 THEN 'Site Access Issues'
    WHEN 8 THEN 'Material Shortage'
    WHEN 9 THEN 'Customer Schedule Change'
    WHEN 10 THEN 'Permit Delays'
    ELSE 'Medical Emergency'
  END,
  -- Realistic detailed descriptions
  CASE (random() * 12)::int
    WHEN 0 THEN 'Crew required to work 3.5 additional hours due to critical infrastructure emergency. Customer power restoration took priority over regular schedule.'
    WHEN 1 THEN 'Primary excavator hydraulic system failed at 2:30 PM. Crew waited 2 hours for backup equipment to arrive from central depot.'
    WHEN 2 THEN 'Severe thunderstorm warning issued at 11 AM. All outdoor electrical work suspended per safety protocol until 3 PM when conditions cleared.'
    WHEN 3 THEN 'Crew member experienced minor injury from tool slip. First aid administered on site, incident report filed, work resumed after safety briefing.'
    WHEN 4 THEN 'Emergency gas leak reported at 6:45 AM. Crew dispatched immediately, disrupting scheduled maintenance work for 4 hours.'
    WHEN 5 THEN 'Mandatory safety training session from 1-4 PM. All crew members required to attend quarterly electrical safety certification update.'
    WHEN 6 THEN 'Service truck transmission failure at remote job site. Crew stranded for 2.5 hours waiting for tow and replacement vehicle.'
    WHEN 7 THEN 'Construction site gate locked, property manager unreachable. Crew waited 90 minutes for alternative access arrangements.'
    WHEN 8 THEN 'Critical replacement parts not delivered as scheduled. Work cannot proceed without specialized transformer components until tomorrow.'
    WHEN 9 THEN 'Customer requested to reschedule service installation from morning to afternoon due to business operations conflict.'
    WHEN 10 THEN 'City permit office delayed approval for underground work. Required environmental clearance not issued until 2 PM.'
    ELSE 'Crew member experienced chest pains, transported to hospital as precaution. Team reduced to skeleton crew for remainder of day.'
  END,
  -- Status distribution: 40% pending, 50% approved, 10% denied
  CASE 
    WHEN random() < 0.4 THEN 'pending'::exception_status
    WHEN random() < 0.9 THEN 'approved'::exception_status
    ELSE 'denied'::exception_status
  END,
  (SELECT id FROM public.profiles WHERE role = 'usp_admin' LIMIT 1),
  t.submitted_at + INTERVAL '30 minutes' + (random() * 90) * INTERVAL '1 minute'
FROM public.timesheets t
JOIN public.crews c ON c.id = t.crew_id
WHERE 
  t.date >= CURRENT_DATE - INTERVAL '7 days'
  -- Company-specific exception rates
  AND (
    (c.name LIKE '%GasWorks%' AND random() < 0.4) OR
    (c.name LIKE '%UtilityMax%' AND random() < 0.35) OR  
    (c.name LIKE '%PowerCorp%' AND random() < 0.25) OR
    (c.name LIKE '%AquaTech%' AND random() < 0.2) OR
    (c.name LIKE '%ElectriCo%' AND random() < 0.3)
  )
ORDER BY random()
LIMIT 35;

-- Add older historical exceptions
INSERT INTO public.exceptions (timesheet_id, exception_type, description, status, submitted_by, reviewed_by, reviewed_at, created_at)
SELECT 
  t.id,
  CASE (random() * 8)::int
    WHEN 0 THEN 'Overtime Request'
    WHEN 1 THEN 'Equipment Malfunction' 
    WHEN 2 THEN 'Weather Delay'
    WHEN 3 THEN 'Emergency Call-Out'
    WHEN 4 THEN 'Training Attendance'
    WHEN 5 THEN 'Vehicle Breakdown'
    WHEN 6 THEN 'Site Access Issues'
    ELSE 'Safety Incident'
  END,
  CASE (random() * 8)::int
    WHEN 0 THEN 'Extended work day due to critical infrastructure repair. Customer facility restoration required immediate attention.'
    WHEN 1 THEN 'Main service vehicle experienced engine problems. Crew productivity reduced while waiting for backup transportation.'
    WHEN 2 THEN 'Heavy rain made outdoor work unsafe. Team performed indoor equipment maintenance instead of scheduled field work.'
    WHEN 3 THEN 'Called out for urgent water main break at 5 AM. Regular schedule completely disrupted for emergency response.'
    WHEN 4 THEN 'Annual recertification training for confined space entry. All qualified crew members required to attend 4-hour session.'
    WHEN 5 THEN 'Fleet maintenance truck broke down with hydraulic failure. Tools and equipment unavailable for 3 hours.'
    WHEN 6 THEN 'Industrial customer locked gate without notice. Security arrangements took 2 hours to resolve access issues.'
    ELSE 'Near-miss incident with overhead power line. Work stopped for safety investigation and team debriefing session.'
  END,
  'approved'::exception_status,
  (SELECT id FROM public.profiles WHERE role = 'usp_admin' LIMIT 1),
  (SELECT id FROM public.profiles WHERE role = 'ep_manager' LIMIT 1),
  t.submitted_at + INTERVAL '4 hours' + (random() * 48) * INTERVAL '1 hour',
  t.submitted_at + INTERVAL '45 minutes'
FROM public.timesheets t
WHERE 
  t.date BETWEEN CURRENT_DATE - INTERVAL '10 days' AND CURRENT_DATE - INTERVAL '8 days'
  AND random() < 0.15
ORDER BY random()
LIMIT 15;