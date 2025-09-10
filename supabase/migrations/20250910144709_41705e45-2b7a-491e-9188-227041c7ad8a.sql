-- Drop the existing check constraint
ALTER TABLE exceptions DROP CONSTRAINT IF EXISTS exceptions_status_check;

-- Add a temporary constraint that allows both rejected and declined
ALTER TABLE exceptions ADD CONSTRAINT exceptions_status_check 
CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'declined'));

-- Update rejected status to declined
UPDATE exceptions 
SET status = 'declined' 
WHERE status = 'rejected';

-- Update the constraint to only allow declined (not rejected)
ALTER TABLE exceptions DROP CONSTRAINT exceptions_status_check;
ALTER TABLE exceptions ADD CONSTRAINT exceptions_status_check 
CHECK (status IN ('submitted', 'under_review', 'accepted', 'declined'));