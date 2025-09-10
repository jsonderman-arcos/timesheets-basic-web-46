-- Update crew names to use unique crew member first names followed by company acronyms
-- This ensures each crew has a unique name pattern like "Mike - VML"

-- Update crews for Grid Tech Services (GTS)
UPDATE crews 
SET crew_name = CASE 
  WHEN crew_name = 'Alpha - GTS' THEN 'Michael - GTS'
  WHEN crew_name = 'Bravo - GTS' THEN 'Daniel - GTS'  
  WHEN crew_name = 'Charlie - GTS' THEN 'Anthony - GTS'
  WHEN crew_name = 'Delta - GTS' THEN 'Joshua - GTS'
  WHEN crew_name = 'Echo - GTS' THEN 'Jacob - GTS'
  WHEN crew_name = 'Foxtrot - GTS' THEN 'Jason - GTS'
  WHEN crew_name = 'Golf - GTS' THEN 'Henry - GTS'
  ELSE crew_name
END
WHERE company_id = (SELECT id FROM companies WHERE name = 'Grid Tech Services');

-- Update crews for PowerLine Solutions LLC (PLS)
UPDATE crews 
SET crew_name = CASE 
  WHEN crew_name = 'Alpha - PLS' THEN 'Patrick - PLS'
  WHEN crew_name = 'Bravo - PLS' THEN 'Gregory - PLS'
  WHEN crew_name = 'Charlie - PLS' THEN 'Larry - PLS'
  WHEN crew_name = 'Delta - PLS' THEN 'Paul - PLS'
  WHEN crew_name = 'Echo - PLS' THEN 'James - PLS'
  WHEN crew_name = 'Foxtrot - PLS' THEN 'Robert - PLS'
  WHEN crew_name = 'Golf - PLS' THEN 'William - PLS'
  ELSE crew_name
END
WHERE company_id = (SELECT id FROM companies WHERE name = 'PowerLine Solutions LLC');

-- Update crews for Storm Response Contractors Inc (SRC)
UPDATE crews 
SET crew_name = CASE 
  WHEN crew_name = 'Alpha - SRC' THEN 'David - SRC'
  WHEN crew_name = 'Bravo - SRC' THEN 'Richard - SRC'
  WHEN crew_name = 'Charlie - SRC' THEN 'Charles - SRC'
  WHEN crew_name = 'Delta - SRC' THEN 'Joseph - SRC'
  WHEN crew_name = 'Echo - SRC' THEN 'Thomas - SRC'
  WHEN crew_name = 'Foxtrot - SRC' THEN 'Christopher - SRC'
  WHEN crew_name = 'Golf - SRC' THEN 'Matthew - SRC'
  ELSE crew_name
END
WHERE company_id = (SELECT id FROM companies WHERE name = 'Storm Response Contractors Inc');

-- Update crews for Utility Infrastructure Partners (UIP)  
UPDATE crews 
SET crew_name = CASE 
  WHEN crew_name = 'Alpha - UIP' THEN 'Andrew - UIP'
  WHEN crew_name = 'Bravo - UIP' THEN 'Kevin - UIP'
  WHEN crew_name = 'Charlie - UIP' THEN 'Brian - UIP'
  WHEN crew_name = 'Delta - UIP' THEN 'George - UIP'
  WHEN crew_name = 'Echo - UIP' THEN 'Edward - UIP'
  WHEN crew_name = 'Foxtrot - UIP' THEN 'Ronald - UIP'
  WHEN crew_name = 'Golf - UIP' THEN 'Timothy - UIP'
  ELSE crew_name
END
WHERE company_id = (SELECT id FROM companies WHERE name = 'Utility Infrastructure Partners');

-- Update crews for VeggieManager LLC (VML)
UPDATE crews 
SET crew_name = CASE 
  WHEN crew_name = 'Alpha - VML' THEN 'Steven - VML'
  WHEN crew_name = 'Bravo - VML' THEN 'Kenneth - VML'
  WHEN crew_name = 'Charlie - VML' THEN 'Mark - VML'
  WHEN crew_name = 'Delta - VML' THEN 'Donald - VML'
  WHEN crew_name = 'Echo - VML' THEN 'Gary - VML'
  WHEN crew_name = 'Foxtrot - VML' THEN 'Eric - VML'
  WHEN crew_name = 'Golf - VML' THEN 'Stephen - VML'
  WHEN crew_name = 'Hotel - VML' THEN 'Scott - VML'
  WHEN crew_name = 'India - VML' THEN 'Raymond - VML'
  WHEN crew_name = 'Juliet - VML' THEN 'Frank - VML'
  ELSE crew_name
END
WHERE company_id = (SELECT id FROM companies WHERE name = 'VeggieManager LLC');