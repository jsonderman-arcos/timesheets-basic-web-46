-- Update GPS coordinates for all crews with unique, realistic Boston area locations
-- Each crew gets up to 10 GPS points per day following road patterns

UPDATE time_entries SET gps_locations = 
CASE 
  -- Crew 1: Downtown Boston/Financial District routes
  WHEN crew_id = '550e8400-e29b-41d4-a716-446655440001' THEN
    CASE 
      WHEN date = '2024-12-01' THEN '[
        {"lat": 42.3581, "lng": -71.0636, "timestamp": "2024-12-01T08:00:00Z", "accuracy": 5},
        {"lat": 42.3574, "lng": -71.0618, "timestamp": "2024-12-01T08:30:00Z", "accuracy": 4},
        {"lat": 42.3569, "lng": -71.0602, "timestamp": "2024-12-01T09:15:00Z", "accuracy": 3},
        {"lat": 42.3562, "lng": -71.0587, "timestamp": "2024-12-01T10:00:00Z", "accuracy": 5},
        {"lat": 42.3555, "lng": -71.0573, "timestamp": "2024-12-01T11:00:00Z", "accuracy": 4},
        {"lat": 42.3548, "lng": -71.0559, "timestamp": "2024-12-01T12:00:00Z", "accuracy": 3},
        {"lat": 42.3541, "lng": -71.0545, "timestamp": "2024-12-01T13:00:00Z", "accuracy": 5},
        {"lat": 42.3534, "lng": -71.0531, "timestamp": "2024-12-01T14:00:00Z", "accuracy": 4},
        {"lat": 42.3527, "lng": -71.0517, "timestamp": "2024-12-01T15:00:00Z", "accuracy": 3},
        {"lat": 42.3520, "lng": -71.0503, "timestamp": "2024-12-01T16:00:00Z", "accuracy": 5}
      ]'::jsonb
      WHEN date = '2024-12-02' THEN '[
        {"lat": 42.3595, "lng": -71.0665, "timestamp": "2024-12-02T08:00:00Z", "accuracy": 4},
        {"lat": 42.3588, "lng": -71.0651, "timestamp": "2024-12-02T08:45:00Z", "accuracy": 3},
        {"lat": 42.3581, "lng": -71.0637, "timestamp": "2024-12-02T09:30:00Z", "accuracy": 5},
        {"lat": 42.3574, "lng": -71.0623, "timestamp": "2024-12-02T10:15:00Z", "accuracy": 4},
        {"lat": 42.3567, "lng": -71.0609, "timestamp": "2024-12-02T11:00:00Z", "accuracy": 3},
        {"lat": 42.3560, "lng": -71.0595, "timestamp": "2024-12-02T12:00:00Z", "accuracy": 5},
        {"lat": 42.3553, "lng": -71.0581, "timestamp": "2024-12-02T13:00:00Z", "accuracy": 4},
        {"lat": 42.3546, "lng": -71.0567, "timestamp": "2024-12-02T14:00:00Z", "accuracy": 3},
        {"lat": 42.3539, "lng": -71.0553, "timestamp": "2024-12-02T15:00:00Z", "accuracy": 5}
      ]'::jsonb
      ELSE gps_locations
    END
    
  -- Crew 2: Cambridge/MIT area routes  
  WHEN crew_id = '550e8400-e29b-41d4-a716-446655440002' THEN
    CASE 
      WHEN date = '2024-12-01' THEN '[
        {"lat": 42.3736, "lng": -71.1097, "timestamp": "2024-12-01T08:00:00Z", "accuracy": 4},
        {"lat": 42.3729, "lng": -71.1083, "timestamp": "2024-12-01T08:30:00Z", "accuracy": 3},
        {"lat": 42.3722, "lng": -71.1069, "timestamp": "2024-12-01T09:15:00Z", "accuracy": 5},
        {"lat": 42.3715, "lng": -71.1055, "timestamp": "2024-12-01T10:00:00Z", "accuracy": 4},
        {"lat": 42.3708, "lng": -71.1041, "timestamp": "2024-12-01T11:00:00Z", "accuracy": 3},
        {"lat": 42.3701, "lng": -71.1027, "timestamp": "2024-12-01T12:00:00Z", "accuracy": 5},
        {"lat": 42.3694, "lng": -71.1013, "timestamp": "2024-12-01T13:00:00Z", "accuracy": 4},
        {"lat": 42.3687, "lng": -71.0999, "timestamp": "2024-12-01T14:00:00Z", "accuracy": 3},
        {"lat": 42.3680, "lng": -71.0985, "timestamp": "2024-12-01T15:00:00Z", "accuracy": 5},
        {"lat": 42.3673, "lng": -71.0971, "timestamp": "2024-12-01T16:00:00Z", "accuracy": 4}
      ]'::jsonb
      WHEN date = '2024-12-02' THEN '[
        {"lat": 42.3750, "lng": -71.1125, "timestamp": "2024-12-02T08:00:00Z", "accuracy": 3},
        {"lat": 42.3743, "lng": -71.1111, "timestamp": "2024-12-02T08:45:00Z", "accuracy": 5},
        {"lat": 42.3736, "lng": -71.1097, "timestamp": "2024-12-02T09:30:00Z", "accuracy": 4},
        {"lat": 42.3729, "lng": -71.1083, "timestamp": "2024-12-02T10:15:00Z", "accuracy": 3},
        {"lat": 42.3722, "lng": -71.1069, "timestamp": "2024-12-02T11:00:00Z", "accuracy": 5},
        {"lat": 42.3715, "lng": -71.1055, "timestamp": "2024-12-02T12:00:00Z", "accuracy": 4},
        {"lat": 42.3708, "lng": -71.1041, "timestamp": "2024-12-02T13:00:00Z", "accuracy": 3},
        {"lat": 42.3701, "lng": -71.1027, "timestamp": "2024-12-02T14:00:00Z", "accuracy": 5},
        {"lat": 42.3694, "lng": -71.1013, "timestamp": "2024-12-02T15:00:00Z", "accuracy": 4}
      ]'::jsonb
      ELSE gps_locations
    END
    
  -- Crew 3: Back Bay/Copley area routes
  WHEN crew_id = '550e8400-e29b-41d4-a716-446655440003' THEN
    CASE 
      WHEN date = '2024-12-01' THEN '[
        {"lat": 42.3467, "lng": -71.0972, "timestamp": "2024-12-01T08:00:00Z", "accuracy": 5},
        {"lat": 42.3474, "lng": -71.0958, "timestamp": "2024-12-01T08:30:00Z", "accuracy": 4},
        {"lat": 42.3481, "lng": -71.0944, "timestamp": "2024-12-01T09:15:00Z", "accuracy": 3},
        {"lat": 42.3488, "lng": -71.0930, "timestamp": "2024-12-01T10:00:00Z", "accuracy": 5},
        {"lat": 42.3495, "lng": -71.0916, "timestamp": "2024-12-01T11:00:00Z", "accuracy": 4},
        {"lat": 42.3502, "lng": -71.0902, "timestamp": "2024-12-01T12:00:00Z", "accuracy": 3},
        {"lat": 42.3509, "lng": -71.0888, "timestamp": "2024-12-01T13:00:00Z", "accuracy": 5},
        {"lat": 42.3516, "lng": -71.0874, "timestamp": "2024-12-01T14:00:00Z", "accuracy": 4},
        {"lat": 42.3523, "lng": -71.0860, "timestamp": "2024-12-01T15:00:00Z", "accuracy": 3},
        {"lat": 42.3530, "lng": -71.0846, "timestamp": "2024-12-01T16:00:00Z", "accuracy": 5}
      ]'::jsonb
      WHEN date = '2024-12-02' THEN '[
        {"lat": 42.3453, "lng": -71.1000, "timestamp": "2024-12-02T08:00:00Z", "accuracy": 4},
        {"lat": 42.3460, "lng": -71.0986, "timestamp": "2024-12-02T08:45:00Z", "accuracy": 3},
        {"lat": 42.3467, "lng": -71.0972, "timestamp": "2024-12-02T09:30:00Z", "accuracy": 5},
        {"lat": 42.3474, "lng": -71.0958, "timestamp": "2024-12-02T10:15:00Z", "accuracy": 4},
        {"lat": 42.3481, "lng": -71.0944, "timestamp": "2024-12-02T11:00:00Z", "accuracy": 3},
        {"lat": 42.3488, "lng": -71.0930, "timestamp": "2024-12-02T12:00:00Z", "accuracy": 5},
        {"lat": 42.3495, "lng": -71.0916, "timestamp": "2024-12-02T13:00:00Z", "accuracy": 4},
        {"lat": 42.3502, "lng": -71.0902, "timestamp": "2024-12-02T14:00:00Z", "accuracy": 3},
        {"lat": 42.3509, "lng": -71.0888, "timestamp": "2024-12-02T15:00:00Z", "accuracy": 5}
      ]'::jsonb
      ELSE gps_locations
    END
    
  -- Crew 4: Somerville/Union Square routes
  WHEN crew_id = '550e8400-e29b-41d4-a716-446655440004' THEN
    CASE 
      WHEN date = '2024-12-01' THEN '[
        {"lat": 42.3837, "lng": -71.0956, "timestamp": "2024-12-01T08:00:00Z", "accuracy": 4},
        {"lat": 42.3844, "lng": -71.0942, "timestamp": "2024-12-01T08:30:00Z", "accuracy": 3},
        {"lat": 42.3851, "lng": -71.0928, "timestamp": "2024-12-01T09:15:00Z", "accuracy": 5},
        {"lat": 42.3858, "lng": -71.0914, "timestamp": "2024-12-01T10:00:00Z", "accuracy": 4},
        {"lat": 42.3865, "lng": -71.0900, "timestamp": "2024-12-01T11:00:00Z", "accuracy": 3},
        {"lat": 42.3872, "lng": -71.0886, "timestamp": "2024-12-01T12:00:00Z", "accuracy": 5},
        {"lat": 42.3879, "lng": -71.0872, "timestamp": "2024-12-01T13:00:00Z", "accuracy": 4},
        {"lat": 42.3886, "lng": -71.0858, "timestamp": "2024-12-01T14:00:00Z", "accuracy": 3},
        {"lat": 42.3893, "lng": -71.0844, "timestamp": "2024-12-01T15:00:00Z", "accuracy": 5},
        {"lat": 42.3900, "lng": -71.0830, "timestamp": "2024-12-01T16:00:00Z", "accuracy": 4}
      ]'::jsonb
      WHEN date = '2024-12-02' THEN '[
        {"lat": 42.3823, "lng": -71.0984, "timestamp": "2024-12-02T08:00:00Z", "accuracy": 3},
        {"lat": 42.3830, "lng": -71.0970, "timestamp": "2024-12-02T08:45:00Z", "accuracy": 5},
        {"lat": 42.3837, "lng": -71.0956, "timestamp": "2024-12-02T09:30:00Z", "accuracy": 4},
        {"lat": 42.3844, "lng": -71.0942, "timestamp": "2024-12-02T10:15:00Z", "accuracy": 3},
        {"lat": 42.3851, "lng": -71.0928, "timestamp": "2024-12-02T11:00:00Z", "accuracy": 5},
        {"lat": 42.3858, "lng": -71.0914, "timestamp": "2024-12-02T12:00:00Z", "accuracy": 4},
        {"lat": 42.3865, "lng": -71.0900, "timestamp": "2024-12-02T13:00:00Z", "accuracy": 3},
        {"lat": 42.3872, "lng": -71.0886, "timestamp": "2024-12-02T14:00:00Z", "accuracy": 5},
        {"lat": 42.3879, "lng": -71.0872, "timestamp": "2024-12-02T15:00:00Z", "accuracy": 4}
      ]'::jsonb
      ELSE gps_locations
    END
    
  -- Crew 5: Charlestown/Navy Yard routes  
  WHEN crew_id = '550e8400-e29b-41d4-a716-446655440005' THEN
    CASE 
      WHEN date = '2024-12-01' THEN '[
        {"lat": 42.3723, "lng": -71.0547, "timestamp": "2024-12-01T08:00:00Z", "accuracy": 5},
        {"lat": 42.3730, "lng": -71.0533, "timestamp": "2024-12-01T08:30:00Z", "accuracy": 4},
        {"lat": 42.3737, "lng": -71.0519, "timestamp": "2024-12-01T09:15:00Z", "accuracy": 3},
        {"lat": 42.3744, "lng": -71.0505, "timestamp": "2024-12-01T10:00:00Z", "accuracy": 5},
        {"lat": 42.3751, "lng": -71.0491, "timestamp": "2024-12-01T11:00:00Z", "accuracy": 4},
        {"lat": 42.3758, "lng": -71.0477, "timestamp": "2024-12-01T12:00:00Z", "accuracy": 3},
        {"lat": 42.3765, "lng": -71.0463, "timestamp": "2024-12-01T13:00:00Z", "accuracy": 5},
        {"lat": 42.3772, "lng": -71.0449, "timestamp": "2024-12-01T14:00:00Z", "accuracy": 4},
        {"lat": 42.3779, "lng": -71.0435, "timestamp": "2024-12-01T15:00:00Z", "accuracy": 3},
        {"lat": 42.3786, "lng": -71.0421, "timestamp": "2024-12-01T16:00:00Z", "accuracy": 5}
      ]'::jsonb
      WHEN date = '2024-12-02' THEN '[
        {"lat": 42.3709, "lng": -71.0575, "timestamp": "2024-12-02T08:00:00Z", "accuracy": 4},
        {"lat": 42.3716, "lng": -71.0561, "timestamp": "2024-12-02T08:45:00Z", "accuracy": 3},
        {"lat": 42.3723, "lng": -71.0547, "timestamp": "2024-12-02T09:30:00Z", "accuracy": 5},
        {"lat": 42.3730, "lng": -71.0533, "timestamp": "2024-12-02T10:15:00Z", "accuracy": 4},
        {"lat": 42.3737, "lng": -71.0519, "timestamp": "2024-12-02T11:00:00Z", "accuracy": 3},
        {"lat": 42.3744, "lng": -71.0505, "timestamp": "2024-12-02T12:00:00Z", "accuracy": 5},
        {"lat": 42.3751, "lng": -71.0491, "timestamp": "2024-12-02T13:00:00Z", "accuracy": 4},
        {"lat": 42.3758, "lng": -71.0477, "timestamp": "2024-12-02T14:00:00Z", "accuracy": 3},
        {"lat": 42.3765, "lng": -71.0463, "timestamp": "2024-12-02T15:00:00Z", "accuracy": 5}
      ]'::jsonb
      ELSE gps_locations
    END
    
  ELSE gps_locations
END
WHERE crew_id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
);