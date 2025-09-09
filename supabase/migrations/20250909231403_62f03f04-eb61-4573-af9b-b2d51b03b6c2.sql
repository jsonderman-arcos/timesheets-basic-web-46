-- Add working, traveling, and standby hours columns to time_entries table
ALTER TABLE time_entries 
ADD COLUMN working_hours NUMERIC(5,2) DEFAULT 0,
ADD COLUMN traveling_hours NUMERIC(5,2) DEFAULT 0,
ADD COLUMN standby_hours NUMERIC(5,2) DEFAULT 0;