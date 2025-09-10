-- Add RLS policy to allow users to update exceptions from their company
CREATE POLICY "Users can update exceptions from their company" 
ON public.exceptions 
FOR UPDATE 
USING (
  time_entry_id IN (
    SELECT te.id
    FROM time_entries te
    JOIN crews c ON te.crew_id = c.id
    WHERE c.company_id IN (
      SELECT users.company_id
      FROM users
      WHERE users.id = auth.uid()
    )
  )
);

-- Add RLS policy to allow utilities to update all exceptions
CREATE POLICY "Utilities can update all exceptions" 
ON public.exceptions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = auth.uid() AND users.role = 'utility'
  )
);

-- Add RLS policy to allow anonymous updates for demo purposes
CREATE POLICY "Allow anonymous exception updates for demo" 
ON public.exceptions 
FOR UPDATE 
USING (true);