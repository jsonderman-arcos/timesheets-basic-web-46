-- Temporarily disable RLS on all tables for prototype/development
-- WARNING: This removes security restrictions. Only use for prototypes!

ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exceptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hours_breakdown DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.storm_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_contracts DISABLE ROW LEVEL SECURITY;