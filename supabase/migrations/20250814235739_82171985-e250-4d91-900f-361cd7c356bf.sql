-- Temporarily disable RLS to insert fake data without auth constraints
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets DISABLE ROW LEVEL SECURITY;

-- Clear existing sample data
DELETE FROM public.timesheets;
DELETE FROM public.crew_members;
DELETE FROM public.crews;
DELETE FROM public.profiles WHERE email LIKE '%@company.com' OR email LIKE '%@powercorp.com' OR email LIKE '%@gasworks.com' OR email LIKE '%@aquatech.com' OR email LIKE '%@electrico.com' OR email LIKE '%@utilitymax.com';

-- Create the 25 crews from 5 companies
INSERT INTO public.crews (name, utility) VALUES
-- PowerCorp (Electric company)
('PowerCorp Alpha Team', 'PowerCorp Electric'),
('PowerCorp Beta Squad', 'PowerCorp Electric'),
('PowerCorp Gamma Crew', 'PowerCorp Electric'),
('PowerCorp Delta Unit', 'PowerCorp Electric'),
('PowerCorp Echo Team', 'PowerCorp Electric'),

-- GasWorks (Gas company)
('GasWorks Red Team', 'GasWorks Gas'),
('GasWorks Blue Squad', 'GasWorks Gas'),
('GasWorks Green Crew', 'GasWorks Gas'),
('GasWorks Yellow Unit', 'GasWorks Gas'),
('GasWorks Orange Team', 'GasWorks Gas'),

-- AquaTech (Water company)  
('AquaTech Flow Team', 'AquaTech Water'),
('AquaTech Stream Squad', 'AquaTech Water'),
('AquaTech Rapids Crew', 'AquaTech Water'),
('AquaTech Current Unit', 'AquaTech Water'),
('AquaTech Wave Team', 'AquaTech Water'),

-- ElectriCo (Electric company)
('ElectriCo Spark Team', 'ElectriCo Electric'),
('ElectriCo Volt Squad', 'ElectriCo Electric'),
('ElectriCo Amp Crew', 'ElectriCo Electric'),
('ElectriCo Ohm Unit', 'ElectriCo Electric'),
('ElectriCo Watt Team', 'ElectriCo Electric'),

-- UtilityMax (Multi-utility)
('UtilityMax Prime Team', 'UtilityMax Multi'),
('UtilityMax Core Squad', 'UtilityMax Multi'),
('UtilityMax Elite Crew', 'UtilityMax Multi'),
('UtilityMax Pro Unit', 'UtilityMax Multi'),
('UtilityMax Max Team', 'UtilityMax Multi');