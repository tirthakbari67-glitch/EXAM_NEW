-- Migration v15: Normalize branches (remove -1, -2 year suffixes) and align student year
-- Run this in your Supabase SQL Editor

-- 1. Update students table
UPDATE students SET year = '1st Year' WHERE branch IN ('BCA-1', 'MBA-1') AND (year IS NULL OR year = '');
UPDATE students SET year = '2nd Year' WHERE branch IN ('BCA-2', 'MBA-2', 'MCA-2', 'BBA-2') AND (year IS NULL OR year = '');

UPDATE students SET branch = 'BCA' WHERE branch IN ('BCA-1', 'BCA-2');
UPDATE students SET branch = 'MBA' WHERE branch IN ('MBA-1', 'MBA-2');
UPDATE students SET branch = 'MCA' WHERE branch IN ('MCA-2');
UPDATE students SET branch = 'BBA' WHERE branch IN ('BBA-2');

-- 2. Update questions table
UPDATE questions SET branch = 'BCA' WHERE branch IN ('BCA-1', 'BCA-2');
UPDATE questions SET branch = 'MBA' WHERE branch IN ('MBA-1', 'MBA-2');
UPDATE questions SET branch = 'MCA' WHERE branch IN ('MCA-2');
UPDATE questions SET branch = 'BBA' WHERE branch IN ('BBA-2');

-- 3. Update faculty_subjects table if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faculty_subjects') THEN
    UPDATE faculty_subjects SET branch = 'BCA' WHERE branch IN ('BCA-1', 'BCA-2');
    UPDATE faculty_subjects SET branch = 'MBA' WHERE branch IN ('MBA-1', 'MBA-2');
    UPDATE faculty_subjects SET branch = 'MCA' WHERE branch IN ('MCA-2');
    UPDATE faculty_subjects SET branch = 'BBA' WHERE branch IN ('BBA-2');
  END IF;
END $$;
