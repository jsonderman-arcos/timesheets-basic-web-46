-- Update all existing draft timesheets to submitted status
UPDATE time_entries 
SET status = 'submitted', 
    submitted_at = COALESCE(submitted_at, created_at)
WHERE status = 'draft';

-- Change the default status to 'submitted' for all new entries
ALTER TABLE time_entries 
ALTER COLUMN status SET DEFAULT 'submitted';