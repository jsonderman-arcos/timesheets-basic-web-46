-- Remove all anonymous demo policies that expose sensitive data
-- This fixes multiple security vulnerabilities while maintaining proper authenticated access

-- Remove anonymous access to companies table (exposes business information)
DROP POLICY IF EXISTS "Allow anonymous company reads for demo" ON public.companies;

-- Remove anonymous access to crews table (exposes crew information and operational data)  
DROP POLICY IF EXISTS "Allow anonymous crew reads for demo" ON public.crews;

-- Remove anonymous access to crew_members table (exposes employee personal info and wages)
DROP POLICY IF EXISTS "Allow anonymous crew_member reads for demo" ON public.crew_members;

-- Remove anonymous access to time_entries table (exposes GPS locations and work records)
DROP POLICY IF EXISTS "Allow anonymous time_entry reads for demo" ON public.time_entries;
DROP POLICY IF EXISTS "Allow anonymous time entry creation for demo" ON public.time_entries;

-- Remove anonymous access to exceptions table (exposes internal incident reports)
DROP POLICY IF EXISTS "Allow anonymous exception reads for demo" ON public.exceptions;
DROP POLICY IF EXISTS "Allow anonymous exception updates for demo" ON public.exceptions;

-- Remove anonymous access to hours_breakdown table (exposes detailed work breakdowns)
DROP POLICY IF EXISTS "Allow anonymous hours_breakdown reads for demo" ON public.hours_breakdown;

-- The following company-scoped policies will remain active for authenticated users:
-- - Users can read crews/crew_members/time_entries from their company
-- - Users can read companies they belong to  
-- - Utilities can read all data (for utility company users)
-- - Users can create/update records for their own company data

-- This ensures that:
-- 1. Anonymous users can no longer access ANY sensitive data
-- 2. Authenticated users maintain full access to their company's data
-- 3. Utility users maintain oversight access to all data
-- 4. All existing functionality for legitimate users is preserved