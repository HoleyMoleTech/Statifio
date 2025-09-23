-- Insert Nexi API keys for test environment
-- This will only insert if the keys don't already exist

INSERT INTO api_keys (
    id,
    key_type,
    key_value,
    environment,
    is_active,
    name,
    description,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'nexi_secret',
    'NEXI_TEST_SECRET_KEY_12345',
    'test',
    true,
    'Nexi Test Secret Key',
    'Secret key for Nexi payment gateway test environment',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'nexi_checkout',
    'NEXI_TEST_CHECKOUT_KEY_67890',
    'test',
    true,
    'Nexi Test Checkout Key',
    'Checkout key for Nexi payment gateway test environment',
    NOW(),
    NOW()
)
ON CONFLICT (key_type, environment) DO UPDATE SET
    key_value = EXCLUDED.key_value,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the keys were inserted
SELECT 
    key_type,
    environment,
    is_active,
    name,
    CASE 
        WHEN key_value IS NOT NULL AND LENGTH(key_value) > 0 THEN 'Present'
        ELSE 'Missing'
    END as key_status
FROM api_keys 
WHERE key_type IN ('nexi_secret', 'nexi_checkout')
ORDER BY key_type;
