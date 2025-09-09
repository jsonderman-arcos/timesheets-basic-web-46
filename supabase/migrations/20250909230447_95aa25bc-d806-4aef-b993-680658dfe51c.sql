-- Create timesheet entries for August 2025 with different patterns for crew groups

DO $$
DECLARE
    crew_record RECORD;
    crew_count INTEGER;
    crew_index INTEGER := 0;
    daily_crew_count INTEGER;
    weekday_crew_count INTEGER;
    weekly_crew_count INTEGER;
    current_date DATE;
    week_start DATE;
    day_of_week INTEGER;
BEGIN
    -- Count total active crews
    SELECT COUNT(*) INTO crew_count FROM crews WHERE active = true;
    
    -- Calculate group sizes
    daily_crew_count := FLOOR(crew_count * 0.8);
    weekday_crew_count := FLOOR(crew_count * 0.1);
    weekly_crew_count := crew_count - daily_crew_count - weekday_crew_count;
    
    RAISE NOTICE 'Processing % crews: % daily, % weekdays, % weekly', 
        crew_count, daily_crew_count, weekday_crew_count, weekly_crew_count;
    
    -- Loop through all active crews
    FOR crew_record IN 
        SELECT id, crew_name FROM crews WHERE active = true ORDER BY crew_name
    LOOP
        crew_index := crew_index + 1;
        
        IF crew_index <= daily_crew_count THEN
            -- Group 1: Daily entries for entire August (80% of crews)
            RAISE NOTICE 'Creating daily entries for crew: %', crew_record.crew_name;
            
            FOR i IN 1..31 LOOP
                current_date := DATE '2025-08-01' + (i - 1);
                
                INSERT INTO time_entries (
                    crew_id,
                    date,
                    start_time,
                    end_time,
                    hours_regular,
                    hours_overtime,
                    work_description,
                    status,
                    created_at
                ) VALUES (
                    crew_record.id,
                    current_date,
                    '08:00:00',
                    '17:00:00',
                    9.0,
                    0.0,
                    'Regular maintenance and repair work',
                    'submitted',
                    NOW()
                );
            END LOOP;
            
        ELSIF crew_index <= daily_crew_count + weekday_crew_count THEN
            -- Group 2: Weekday entries only (10% of crews)
            RAISE NOTICE 'Creating weekday entries for crew: %', crew_record.crew_name;
            
            FOR i IN 1..31 LOOP
                current_date := DATE '2025-08-01' + (i - 1);
                day_of_week := EXTRACT(DOW FROM current_date); -- 0=Sunday, 1=Monday, etc.
                
                -- Only create entries for Monday through Friday (1-5)
                IF day_of_week BETWEEN 1 AND 5 THEN
                    INSERT INTO time_entries (
                        crew_id,
                        date,
                        start_time,
                        end_time,
                        hours_regular,
                        hours_overtime,
                        work_description,
                        status,
                        created_at
                    ) VALUES (
                        crew_record.id,
                        current_date,
                        '08:00:00',
                        '17:00:00',
                        9.0,
                        0.0,
                        'Weekday operations and maintenance',
                        'submitted',
                        NOW()
                    );
                END IF;
            END LOOP;
            
        ELSE
            -- Group 3: One entry per week (remaining 10% of crews)
            RAISE NOTICE 'Creating weekly entries for crew: %', crew_record.crew_name;
            
            -- Create entries for Wednesdays of each week in August
            FOR week_num IN 0..4 LOOP
                week_start := DATE '2025-08-01' + (week_num * 7);
                -- Find the first Wednesday of each week period
                current_date := week_start;
                
                -- Adjust to find Wednesday (day 3) of the week
                WHILE EXTRACT(DOW FROM current_date) != 3 AND current_date <= DATE '2025-08-31' LOOP
                    current_date := current_date + 1;
                END LOOP;
                
                -- Only insert if the date is still in August
                IF current_date <= DATE '2025-08-31' THEN
                    INSERT INTO time_entries (
                        crew_id,
                        date,
                        start_time,
                        end_time,
                        hours_regular,
                        hours_overtime,
                        work_description,
                        status,
                        created_at
                    ) VALUES (
                        crew_record.id,
                        current_date,
                        '08:00:00',
                        '17:00:00',
                        9.0,
                        0.0,
                        'Weekly scheduled maintenance',
                        'submitted',
                        NOW()
                    );
                END IF;
            END LOOP;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Completed timesheet generation for August 2025';
END $$;