-- Insert fake data for 25 crews from 5 companies

-- First, let's clear existing sample data to avoid conflicts
DELETE FROM public.timesheets;
DELETE FROM public.crew_members;
DELETE FROM public.crews;
DELETE FROM public.profiles WHERE email LIKE '%@company.com';

-- Insert 100 fake user profiles (25 crews * 4 people each)
-- We'll use generated UUIDs since we don't have real auth users
INSERT INTO public.profiles (user_id, email, full_name, role) VALUES
-- PowerCorp crews (5 crews, 20 people)
(gen_random_uuid(), 'mike.johnson@powercorp.com', 'Mike Johnson', 'supervisor'),
(gen_random_uuid(), 'sarah.williams@powercorp.com', 'Sarah Williams', 'crew_member'),
(gen_random_uuid(), 'david.brown@powercorp.com', 'David Brown', 'crew_member'),
(gen_random_uuid(), 'lisa.davis@powercorp.com', 'Lisa Davis', 'crew_member'),

(gen_random_uuid(), 'james.wilson@powercorp.com', 'James Wilson', 'supervisor'),
(gen_random_uuid(), 'maria.garcia@powercorp.com', 'Maria Garcia', 'crew_member'),
(gen_random_uuid(), 'robert.martinez@powercorp.com', 'Robert Martinez', 'crew_member'),
(gen_random_uuid(), 'jennifer.anderson@powercorp.com', 'Jennifer Anderson', 'crew_member'),

(gen_random_uuid(), 'michael.taylor@powercorp.com', 'Michael Taylor', 'supervisor'),
(gen_random_uuid(), 'ashley.thomas@powercorp.com', 'Ashley Thomas', 'crew_member'),
(gen_random_uuid(), 'william.jackson@powercorp.com', 'William Jackson', 'crew_member'),
(gen_random_uuid(), 'elizabeth.white@powercorp.com', 'Elizabeth White', 'crew_member'),

(gen_random_uuid(), 'daniel.harris@powercorp.com', 'Daniel Harris', 'supervisor'),
(gen_random_uuid(), 'amanda.martin@powercorp.com', 'Amanda Martin', 'crew_member'),
(gen_random_uuid(), 'christopher.thompson@powercorp.com', 'Christopher Thompson', 'crew_member'),
(gen_random_uuid(), 'stephanie.garcia@powercorp.com', 'Stephanie Garcia', 'crew_member'),

(gen_random_uuid(), 'matthew.clark@powercorp.com', 'Matthew Clark', 'supervisor'),
(gen_random_uuid(), 'melissa.rodriguez@powercorp.com', 'Melissa Rodriguez', 'crew_member'),
(gen_random_uuid(), 'anthony.lewis@powercorp.com', 'Anthony Lewis', 'crew_member'),
(gen_random_uuid(), 'nicole.lee@powercorp.com', 'Nicole Lee', 'crew_member'),

-- GasWorks crews (5 crews, 20 people)
(gen_random_uuid(), 'kevin.walker@gasworks.com', 'Kevin Walker', 'supervisor'),
(gen_random_uuid(), 'samantha.hall@gasworks.com', 'Samantha Hall', 'crew_member'),
(gen_random_uuid(), 'ryan.allen@gasworks.com', 'Ryan Allen', 'crew_member'),
(gen_random_uuid(), 'brittany.young@gasworks.com', 'Brittany Young', 'crew_member'),

(gen_random_uuid(), 'joshua.hernandez@gasworks.com', 'Joshua Hernandez', 'supervisor'),
(gen_random_uuid(), 'rachel.king@gasworks.com', 'Rachel King', 'crew_member'),
(gen_random_uuid(), 'brandon.wright@gasworks.com', 'Brandon Wright', 'crew_member'),
(gen_random_uuid(), 'megan.lopez@gasworks.com', 'Megan Lopez', 'crew_member'),

(gen_random_uuid(), 'justin.hill@gasworks.com', 'Justin Hill', 'supervisor'),
(gen_random_uuid(), 'kimberly.scott@gasworks.com', 'Kimberly Scott', 'crew_member'),
(gen_random_uuid(), 'tyler.green@gasworks.com', 'Tyler Green', 'crew_member'),
(gen_random_uuid(), 'crystal.adams@gasworks.com', 'Crystal Adams', 'crew_member'),

(gen_random_uuid(), 'austin.baker@gasworks.com', 'Austin Baker', 'supervisor'),
(gen_random_uuid(), 'vanessa.gonzalez@gasworks.com', 'Vanessa Gonzalez', 'crew_member'),
(gen_random_uuid(), 'cody.nelson@gasworks.com', 'Cody Nelson', 'crew_member'),
(gen_random_uuid(), 'tiffany.carter@gasworks.com', 'Tiffany Carter', 'crew_member'),

(gen_random_uuid(), 'derek.mitchell@gasworks.com', 'Derek Mitchell', 'supervisor'),
(gen_random_uuid(), 'lindsay.perez@gasworks.com', 'Lindsay Perez', 'crew_member'),
(gen_random_uuid(), 'jordan.roberts@gasworks.com', 'Jordan Roberts', 'crew_member'),
(gen_random_uuid(), 'courtney.turner@gasworks.com', 'Courtney Turner', 'crew_member'),

-- AquaTech crews (5 crews, 20 people)
(gen_random_uuid(), 'scott.phillips@aquatech.com', 'Scott Phillips', 'supervisor'),
(gen_random_uuid(), 'rebecca.campbell@aquatech.com', 'Rebecca Campbell', 'crew_member'),
(gen_random_uuid(), 'seth.parker@aquatech.com', 'Seth Parker', 'crew_member'),
(gen_random_uuid(), 'heather.evans@aquatech.com', 'Heather Evans', 'crew_member'),

(gen_random_uuid(), 'trevor.edwards@aquatech.com', 'Trevor Edwards', 'supervisor'),
(gen_random_uuid(), 'natalie.collins@aquatech.com', 'Natalie Collins', 'crew_member'),
(gen_random_uuid(), 'lucas.stewart@aquatech.com', 'Lucas Stewart', 'crew_member'),
(gen_random_uuid(), 'danielle.sanchez@aquatech.com', 'Danielle Sanchez', 'crew_member'),

(gen_random_uuid(), 'caleb.morris@aquatech.com', 'Caleb Morris', 'supervisor'),
(gen_random_uuid(), 'alexis.rogers@aquatech.com', 'Alexis Rogers', 'crew_member'),
(gen_random_uuid(), 'mason.reed@aquatech.com', 'Mason Reed', 'crew_member'),
(gen_random_uuid(), 'sierra.cook@aquatech.com', 'Sierra Cook', 'crew_member'),

(gen_random_uuid(), 'logan.morgan@aquatech.com', 'Logan Morgan', 'supervisor'),
(gen_random_uuid(), 'destiny.bailey@aquatech.com', 'Destiny Bailey', 'crew_member'),
(gen_random_uuid(), 'blake.cooper@aquatech.com', 'Blake Cooper', 'crew_member'),
(gen_random_uuid(), 'jasmine.richardson@aquatech.com', 'Jasmine Richardson', 'crew_member'),

(gen_random_uuid(), 'hunter.cox@aquatech.com', 'Hunter Cox', 'supervisor'),
(gen_random_uuid(), 'paige.ward@aquatech.com', 'Paige Ward', 'crew_member'),
(gen_random_uuid(), 'connor.torres@aquatech.com', 'Connor Torres', 'crew_member'),
(gen_random_uuid(), 'miranda.peterson@aquatech.com', 'Miranda Peterson', 'crew_member'),

-- ElectriCo crews (5 crews, 20 people)
(gen_random_uuid(), 'chase.gray@electrico.com', 'Chase Gray', 'supervisor'),
(gen_random_uuid(), 'brooke.ramirez@electrico.com', 'Brooke Ramirez', 'crew_member'),
(gen_random_uuid(), 'ian.james@electrico.com', 'Ian James', 'crew_member'),
(gen_random_uuid(), 'taylor.watson@electrico.com', 'Taylor Watson', 'crew_member'),

(gen_random_uuid(), 'cole.brooks@electrico.com', 'Cole Brooks', 'supervisor'),
(gen_random_uuid(), 'morgan.kelly@electrico.com', 'Morgan Kelly', 'crew_member'),
(gen_random_uuid(), 'drew.sanders@electrico.com', 'Drew Sanders', 'crew_member'),
(gen_random_uuid(), 'sydney.price@electrico.com', 'Sydney Price', 'crew_member'),

(gen_random_uuid(), 'shane.bennett@electrico.com', 'Shane Bennett', 'supervisor'),
(gen_random_uuid(), 'casey.wood@electrico.com', 'Casey Wood', 'crew_member'),
(gen_random_uuid(), 'owen.barnes@electrico.com', 'Owen Barnes', 'crew_member'),
(gen_random_uuid(), 'jordan.ross@electrico.com', 'Jordan Ross', 'crew_member'),

(gen_random_uuid(), 'tanner.henderson@electrico.com', 'Tanner Henderson', 'supervisor'),
(gen_random_uuid(), 'alexis.coleman@electrico.com', 'Alexis Coleman', 'crew_member'),
(gen_random_uuid(), 'spencer.jenkins@electrico.com', 'Spencer Jenkins', 'crew_member'),
(gen_random_uuid(), 'gabrielle.perry@electrico.com', 'Gabrielle Perry', 'crew_member'),

(gen_random_uuid(), 'cameron.powell@electrico.com', 'Cameron Powell', 'supervisor'),
(gen_random_uuid(), 'marissa.long@electrico.com', 'Marissa Long', 'crew_member'),
(gen_random_uuid(), 'dalton.patterson@electrico.com', 'Dalton Patterson', 'crew_member'),
(gen_random_uuid(), 'jenna.hughes@electrico.com', 'Jenna Hughes', 'crew_member'),

-- UtilityMax crews (5 crews, 20 people)
(gen_random_uuid(), 'garrett.flores@utilitymax.com', 'Garrett Flores', 'supervisor'),
(gen_random_uuid(), 'kayla.washington@utilitymax.com', 'Kayla Washington', 'crew_member'),
(gen_random_uuid(), 'mitchell.butler@utilitymax.com', 'Mitchell Butler', 'crew_member'),
(gen_random_uuid(), 'brianna.simmons@utilitymax.com', 'Brianna Simmons', 'crew_member'),

(gen_random_uuid(), 'wyatt.foster@utilitymax.com', 'Wyatt Foster', 'supervisor'),
(gen_random_uuid(), 'hannah.gonzales@utilitymax.com', 'Hannah Gonzales', 'crew_member'),
(gen_random_uuid(), 'preston.bryant@utilitymax.com', 'Preston Bryant', 'crew_member'),
(gen_random_uuid(), 'katelyn.alexander@utilitymax.com', 'Katelyn Alexander', 'crew_member'),

(gen_random_uuid(), 'landon.russell@utilitymax.com', 'Landon Russell', 'supervisor'),
(gen_random_uuid(), 'sara.griffin@utilitymax.com', 'Sara Griffin', 'crew_member'),
(gen_random_uuid(), 'colton.diaz@utilitymax.com', 'Colton Diaz', 'crew_member'),
(gen_random_uuid(), 'mia.hayes@utilitymax.com', 'Mia Hayes', 'crew_member'),

(gen_random_uuid(), 'brayden.myers@utilitymax.com', 'Brayden Myers', 'supervisor'),
(gen_random_uuid(), 'andrea.ford@utilitymax.com', 'Andrea Ford', 'crew_member'),
(gen_random_uuid(), 'riley.hamilton@utilitymax.com', 'Riley Hamilton', 'crew_member'),
(gen_random_uuid(), 'lauren.graham@utilitymax.com', 'Lauren Graham', 'crew_member'),

(gen_random_uuid(), 'carson.sullivan@utilitymax.com', 'Carson Sullivan', 'supervisor'),
(gen_random_uuid(), 'chloe.wallace@utilitymax.com', 'Chloe Wallace', 'crew_member'),
(gen_random_uuid(), 'parker.woods@utilitymax.com', 'Parker Woods', 'crew_member'),
(gen_random_uuid(), 'emma.cole@utilitymax.com', 'Emma Cole', 'crew_member');