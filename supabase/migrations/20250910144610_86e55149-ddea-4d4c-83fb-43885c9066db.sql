-- First, drop the existing check constraint
ALTER TABLE exceptions DROP CONSTRAINT IF EXISTS exceptions_status_check;

-- Add a new check constraint that includes 'declined' instead of 'rejected'
ALTER TABLE exceptions ADD CONSTRAINT exceptions_status_check 
CHECK (status IN ('submitted', 'under_review', 'accepted', 'declined'));

-- Now update rejected status to declined in exceptions table
UPDATE exceptions 
SET status = 'declined' 
WHERE status = 'rejected';