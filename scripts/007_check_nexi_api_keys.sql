-- Check current Nexi API keys in the database
SELECT 
    key_type,
    environment,
    is_active,
    created_at,
    CASE 
        WHEN key_value IS NOT NULL AND LENGTH(key_value) > 0 THEN 'Present'
        ELSE 'Missing'
    END as key_status,
    description
FROM api_keys 
WHERE key_type IN ('nexi_secret', 'nexi_checkout')
ORDER BY key_type, environment;

-- Also check if the api_keys table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'api_keys' 
AND table_schema = 'public'
ORDER BY ordinal_position;
