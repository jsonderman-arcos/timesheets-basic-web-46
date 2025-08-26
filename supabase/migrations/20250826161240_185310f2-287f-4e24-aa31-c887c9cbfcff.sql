-- Add demo policies to allow anonymous access for development
-- These should be removed in production

-- Allow anonymous reads for companies (for demo)
CREATE POLICY "Allow anonymous company reads for demo" 
ON public.companies 
FOR SELECT 
USING (true);

-- Allow anonymous reads for crews (for demo)
CREATE POLICY "Allow anonymous crew reads for demo" 
ON public.crews 
FOR SELECT 
USING (true);

-- Allow anonymous reads for crew_members (for demo)
CREATE POLICY "Allow anonymous crew_member reads for demo" 
ON public.crew_members 
FOR SELECT 
USING (true);

-- Allow anonymous reads for time_entries (for demo)
CREATE POLICY "Allow anonymous time_entry reads for demo" 
ON public.time_entries 
FOR SELECT 
USING (true);

-- Allow anonymous reads for exceptions (for demo)
CREATE POLICY "Allow anonymous exception reads for demo" 
ON public.exceptions 
FOR SELECT 
USING (true);

-- Allow anonymous reads for hours_breakdown (for demo)
CREATE POLICY "Allow anonymous hours_breakdown reads for demo" 
ON public.hours_breakdown 
FOR SELECT 
USING (true);