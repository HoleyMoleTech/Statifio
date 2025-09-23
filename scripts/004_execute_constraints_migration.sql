-- Execute the unique constraints migration
-- This script runs the constraints from 003_add_unique_constraints.sql

-- Adding execution wrapper for the constraints migration
\i scripts/003_add_unique_constraints.sql

-- Verify constraints were added successfully
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name
FROM pg_constraint 
WHERE conname LIKE '%external_id%unique%'
ORDER BY table_name;
