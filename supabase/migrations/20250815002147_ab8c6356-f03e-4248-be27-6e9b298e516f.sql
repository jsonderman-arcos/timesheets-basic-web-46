-- Temporarily disable RLS for prototype - make exceptions table publicly readable
ALTER TABLE public.exceptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;