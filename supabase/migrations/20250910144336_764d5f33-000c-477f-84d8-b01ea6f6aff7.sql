-- Update rejected status to declined in exceptions table
UPDATE exceptions 
SET status = 'declined' 
WHERE status = 'rejected';