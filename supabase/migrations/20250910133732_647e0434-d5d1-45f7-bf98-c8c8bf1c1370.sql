-- Update crew names to be unique across all companies by incorporating company names
UPDATE crews 
SET crew_name = CONCAT(
  CASE 
    WHEN crew_name = 'Alpha Crew' THEN 'Alpha'
    WHEN crew_name = 'Bravo Crew' THEN 'Bravo' 
    WHEN crew_name = 'Charlie Crew' THEN 'Charlie'
    WHEN crew_name = 'Delta Crew' THEN 'Delta'
    WHEN crew_name = 'Echo Crew' THEN 'Echo'
    WHEN crew_name = 'Foxtrot Crew' THEN 'Foxtrot'
    WHEN crew_name = 'Golf Crew' THEN 'Golf'
    WHEN crew_name = 'Hotel Crew' THEN 'Hotel'
    WHEN crew_name = 'India Crew' THEN 'India'
    WHEN crew_name = 'Juliet Crew' THEN 'Juliet'
    ELSE crew_name
  END,
  ' - ',
  CASE 
    WHEN companies.name = 'Grid Tech Services' THEN 'GTS'
    WHEN companies.name = 'PowerLine Solutions LLC' THEN 'PLS'
    WHEN companies.name = 'Storm Response Contractors Inc' THEN 'SRC'
    WHEN companies.name = 'Utility Infrastructure Partners' THEN 'UIP'
    WHEN companies.name = 'VeggieManager LLC' THEN 'VML'
    ELSE LEFT(companies.name, 3)
  END
)
FROM companies 
WHERE crews.company_id = companies.id;