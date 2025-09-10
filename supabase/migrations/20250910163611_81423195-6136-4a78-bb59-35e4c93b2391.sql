-- Update all GPS coordinates to Boston MA area with different routes for different crews
-- Boston Downtown area route (42.3601, -71.0589 as starting point)
UPDATE time_entries 
SET gps_locations = jsonb_build_array(
  jsonb_build_object('latitude', 42.3601, 'longitude', -71.0589, 'timestamp', date::text || 'T08:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3615, 'longitude', -71.0605, 'timestamp', date::text || 'T08:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3629, 'longitude', -71.0621, 'timestamp', date::text || 'T09:00:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3643, 'longitude', -71.0637, 'timestamp', date::text || 'T09:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3657, 'longitude', -71.0653, 'timestamp', date::text || 'T10:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3671, 'longitude', -71.0669, 'timestamp', date::text || 'T10:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3685, 'longitude', -71.0685, 'timestamp', date::text || 'T11:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3699, 'longitude', -71.0701, 'timestamp', date::text || 'T11:30:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3713, 'longitude', -71.0717, 'timestamp', date::text || 'T12:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3727, 'longitude', -71.0733, 'timestamp', date::text || 'T12:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3741, 'longitude', -71.0749, 'timestamp', date::text || 'T13:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3755, 'longitude', -71.0765, 'timestamp', date::text || 'T13:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3769, 'longitude', -71.0781, 'timestamp', date::text || 'T14:00:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3783, 'longitude', -71.0797, 'timestamp', date::text || 'T14:30:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3797, 'longitude', -71.0813, 'timestamp', date::text || 'T15:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3811, 'longitude', -71.0829, 'timestamp', date::text || 'T15:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3825, 'longitude', -71.0845, 'timestamp', date::text || 'T16:00:00', 'accuracy', 5)
)
WHERE crew_id = '0bf0d346-1dd2-4adb-8e25-f567bfb24fc6' AND gps_locations IS NOT NULL;

-- Cambridge area route (42.3736, -71.1097 as starting point)
UPDATE time_entries 
SET gps_locations = jsonb_build_array(
  jsonb_build_object('latitude', 42.3736, 'longitude', -71.1097, 'timestamp', date::text || 'T08:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3748, 'longitude', -71.1085, 'timestamp', date::text || 'T08:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3760, 'longitude', -71.1073, 'timestamp', date::text || 'T09:00:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3772, 'longitude', -71.1061, 'timestamp', date::text || 'T09:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3784, 'longitude', -71.1049, 'timestamp', date::text || 'T10:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3796, 'longitude', -71.1037, 'timestamp', date::text || 'T10:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3808, 'longitude', -71.1025, 'timestamp', date::text || 'T11:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3820, 'longitude', -71.1013, 'timestamp', date::text || 'T11:30:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3832, 'longitude', -71.1001, 'timestamp', date::text || 'T12:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3844, 'longitude', -71.0989, 'timestamp', date::text || 'T12:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3856, 'longitude', -71.0977, 'timestamp', date::text || 'T13:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3868, 'longitude', -71.0965, 'timestamp', date::text || 'T13:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3880, 'longitude', -71.0953, 'timestamp', date::text || 'T14:00:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3892, 'longitude', -71.0941, 'timestamp', date::text || 'T14:30:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3904, 'longitude', -71.0929, 'timestamp', date::text || 'T15:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3916, 'longitude', -71.0917, 'timestamp', date::text || 'T15:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3928, 'longitude', -71.0905, 'timestamp', date::text || 'T16:00:00', 'accuracy', 5)
)
WHERE crew_id = '2417011c-f2fd-454d-9fd7-2ad85dad360c' AND gps_locations IS NOT NULL;

-- Back Bay area route (42.3505, -71.0753 as starting point)
UPDATE time_entries 
SET gps_locations = jsonb_build_array(
  jsonb_build_object('latitude', 42.3505, 'longitude', -71.0753, 'timestamp', date::text || 'T08:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3519, 'longitude', -71.0767, 'timestamp', date::text || 'T08:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3533, 'longitude', -71.0781, 'timestamp', date::text || 'T09:00:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3547, 'longitude', -71.0795, 'timestamp', date::text || 'T09:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3561, 'longitude', -71.0809, 'timestamp', date::text || 'T10:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3575, 'longitude', -71.0823, 'timestamp', date::text || 'T10:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3589, 'longitude', -71.0837, 'timestamp', date::text || 'T11:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3603, 'longitude', -71.0851, 'timestamp', date::text || 'T11:30:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3617, 'longitude', -71.0865, 'timestamp', date::text || 'T12:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3631, 'longitude', -71.0879, 'timestamp', date::text || 'T12:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3645, 'longitude', -71.0893, 'timestamp', date::text || 'T13:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3659, 'longitude', -71.0907, 'timestamp', date::text || 'T13:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3673, 'longitude', -71.0921, 'timestamp', date::text || 'T14:00:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3687, 'longitude', -71.0935, 'timestamp', date::text || 'T14:30:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3701, 'longitude', -71.0949, 'timestamp', date::text || 'T15:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3715, 'longitude', -71.0963, 'timestamp', date::text || 'T15:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3729, 'longitude', -71.0977, 'timestamp', date::text || 'T16:00:00', 'accuracy', 5)
)
WHERE crew_id = '8685dabc-746e-4fe8-90a3-c41035c79dc0' AND gps_locations IS NOT NULL;

-- Somerville area route (42.3875, -71.0995 as starting point)
UPDATE time_entries 
SET gps_locations = jsonb_build_array(
  jsonb_build_object('latitude', 42.3875, 'longitude', -71.0995, 'timestamp', date::text || 'T08:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3887, 'longitude', -71.1007, 'timestamp', date::text || 'T08:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3899, 'longitude', -71.1019, 'timestamp', date::text || 'T09:00:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3911, 'longitude', -71.1031, 'timestamp', date::text || 'T09:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3923, 'longitude', -71.1043, 'timestamp', date::text || 'T10:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3935, 'longitude', -71.1055, 'timestamp', date::text || 'T10:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3947, 'longitude', -71.1067, 'timestamp', date::text || 'T11:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3959, 'longitude', -71.1079, 'timestamp', date::text || 'T11:30:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.3971, 'longitude', -71.1091, 'timestamp', date::text || 'T12:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.3983, 'longitude', -71.1103, 'timestamp', date::text || 'T12:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.3995, 'longitude', -71.1115, 'timestamp', date::text || 'T13:00:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.4007, 'longitude', -71.1127, 'timestamp', date::text || 'T13:30:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.4019, 'longitude', -71.1139, 'timestamp', date::text || 'T14:00:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.4031, 'longitude', -71.1151, 'timestamp', date::text || 'T14:30:00', 'accuracy', 5),
  jsonb_build_object('latitude', 42.4043, 'longitude', -71.1163, 'timestamp', date::text || 'T15:00:00', 'accuracy', 4),
  jsonb_build_object('latitude', 42.4055, 'longitude', -71.1175, 'timestamp', date::text || 'T15:30:00', 'accuracy', 3),
  jsonb_build_object('latitude', 42.4067, 'longitude', -71.1187, 'timestamp', date::text || 'T16:00:00', 'accuracy', 5)
)
WHERE crew_id IN (
  SELECT DISTINCT crew_id 
  FROM time_entries 
  WHERE gps_locations IS NOT NULL 
  AND crew_id NOT IN ('0bf0d346-1dd2-4adb-8e25-f567bfb24fc6', '2417011c-f2fd-454d-9fd7-2ad85dad360c', '8685dabc-746e-4fe8-90a3-c41035c79dc0')
);