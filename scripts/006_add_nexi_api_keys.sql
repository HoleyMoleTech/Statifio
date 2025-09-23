-- Add Nexi API keys to the existing api_keys table
INSERT INTO api_keys (name, description, key_type, key_value, is_active, environment, created_at)
VALUES 
  (
    'Nexi Test Secret Key',
    'Nexi payment gateway secret key for test environment',
    'nexi_secret',
    'cafb401746d04beb9c1f3cb55a2ca59f',
    true,
    'test',
    NOW()
  ),
  (
    'Nexi Test Checkout Key',
    'Nexi payment gateway checkout key for test environment',
    'nexi_checkout',
    'c4d049c4d6964dbf8a641e5a23f7184f',
    true,
    'test',
    NOW()
  );

-- Update KEY_TYPES to include Nexi
-- This will be handled in the component update
