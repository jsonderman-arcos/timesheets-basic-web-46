-- Update Mark - VML crew to have only 5 people: 1 foreman, 1 apprentice, 3 journeyman linemen
-- Keep: Robert Johnson (Foreman), Gregory Mitchell (Apprentice), Anthony Davis, Daniel Wilson, Paul Thomas (Journeyman Linemen)
-- Deactivate the rest

UPDATE crew_members 
SET active = false 
WHERE crew_id = '0bf0d346-1dd2-4adb-8e25-f567bfb24fc6' 
AND id IN (
  '749d3efa-3063-4d1a-bfda-698ff863e477', -- Henry Sanchez (Apprentice Lineman)
  '8252c8af-5e49-4d96-99d9-49fc7ae41939', -- Patrick Phillips (Apprentice Lineman) 
  '21cbd9ac-754d-42d3-9060-8affa88279ea', -- Jacob Wright (Equipment Operator)
  'b9137083-6a01-4945-9e0b-47ef538cd517', -- Larry Baker (Equipment Operator)
  '6639f691-f026-4141-a6af-bead379a0902', -- Jason Young (Underground Specialist)
  '8d504b15-a19c-416a-a6b5-5e65b1acbd95'  -- Joshua Harris (Underground Specialist)
);