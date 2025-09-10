-- Update GPS coordinates to Boston area following logical road patterns
UPDATE time_entries 
SET gps_locations = '[
  {
    "latitude": 42.3601,
    "longitude": -71.0589,
    "timestamp": "2025-08-27T08:00:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3611,
    "longitude": -71.0601,
    "timestamp": "2025-08-27T08:30:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3625,
    "longitude": -71.0615,
    "timestamp": "2025-08-27T09:00:00",
    "accuracy": 3
  },
  {
    "latitude": 42.3638,
    "longitude": -71.0628,
    "timestamp": "2025-08-27T09:30:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3652,
    "longitude": -71.0642,
    "timestamp": "2025-08-27T10:00:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3665,
    "longitude": -71.0655,
    "timestamp": "2025-08-27T10:30:00",
    "accuracy": 3
  },
  {
    "latitude": 42.3678,
    "longitude": -71.0668,
    "timestamp": "2025-08-27T11:00:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3691,
    "longitude": -71.0681,
    "timestamp": "2025-08-27T11:30:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3704,
    "longitude": -71.0694,
    "timestamp": "2025-08-27T12:00:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3717,
    "longitude": -71.0707,
    "timestamp": "2025-08-27T12:30:00",
    "accuracy": 3
  },
  {
    "latitude": 42.3730,
    "longitude": -71.0720,
    "timestamp": "2025-08-27T13:00:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3743,
    "longitude": -71.0733,
    "timestamp": "2025-08-27T13:30:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3756,
    "longitude": -71.0746,
    "timestamp": "2025-08-27T14:00:00",
    "accuracy": 3
  },
  {
    "latitude": 42.3769,
    "longitude": -71.0759,
    "timestamp": "2025-08-27T14:30:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3782,
    "longitude": -71.0772,
    "timestamp": "2025-08-27T15:00:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3795,
    "longitude": -71.0785,
    "timestamp": "2025-08-27T15:30:00",
    "accuracy": 3
  },
  {
    "latitude": 42.3808,
    "longitude": -71.0798,
    "timestamp": "2025-08-27T16:00:00",
    "accuracy": 5
  }
]'::jsonb
WHERE date = '2025-08-27' AND gps_locations IS NOT NULL;

-- Update GPS coordinates for another date to show different route pattern
UPDATE time_entries 
SET gps_locations = '[
  {
    "latitude": 42.3505,
    "longitude": -71.0495,
    "timestamp": "2025-08-26T08:00:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3518,
    "longitude": -71.0508,
    "timestamp": "2025-08-26T08:30:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3531,
    "longitude": -71.0521,
    "timestamp": "2025-08-26T09:00:00",
    "accuracy": 3
  },
  {
    "latitude": 42.3544,
    "longitude": -71.0534,
    "timestamp": "2025-08-26T09:30:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3557,
    "longitude": -71.0547,
    "timestamp": "2025-08-26T10:00:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3570,
    "longitude": -71.0560,
    "timestamp": "2025-08-26T10:30:00",
    "accuracy": 3
  },
  {
    "latitude": 42.3583,
    "longitude": -71.0573,
    "timestamp": "2025-08-26T11:00:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3596,
    "longitude": -71.0586,
    "timestamp": "2025-08-26T11:30:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3609,
    "longitude": -71.0599,
    "timestamp": "2025-08-26T12:00:00",
    "accuracy": 4
  },
  {
    "latitude": 42.3622,
    "longitude": -71.0612,
    "timestamp": "2025-08-26T12:30:00",
    "accuracy": 3
  },
  {
    "latitude": 42.3635,
    "longitude": -71.0625,
    "timestamp": "2025-08-26T13:00:00",
    "accuracy": 5
  },
  {
    "latitude": 42.3648,
    "longitude": -71.0638,
    "timestamp": "2025-08-26T13:30:00",
    "accuracy": 4
  }
]'::jsonb
WHERE date = '2025-08-26' AND gps_locations IS NOT NULL;