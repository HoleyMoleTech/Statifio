-- Deployment Readiness Check
-- This script verifies that all required data and configurations are in place

-- Check if admin user exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS: Admin user configured'
    ELSE 'FAIL: No admin user found - run setup-admin API'
  END as admin_check
FROM auth.users 
WHERE email LIKE '%admin%' OR id IN (
  SELECT user_id FROM user_profiles WHERE role = 'admin'
);

-- Check if API keys are configured
SELECT 
  CASE 
    WHEN COUNT(*) >= 2 THEN 'PASS: API keys configured'
    ELSE 'FAIL: Missing API keys - run Nexi setup scripts'
  END as api_keys_check
FROM api_keys 
WHERE key_type IN ('nexi_secret', 'nexi_checkout');

-- Check if teams data exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('PASS: ', COUNT(*), ' teams in database')
    ELSE 'FAIL: No teams data - run population scripts'
  END as teams_check
FROM teams;

-- Check if matches data exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN CONCAT('PASS: ', COUNT(*), ' matches in database')
    ELSE 'FAIL: No matches data - run sync scripts'
  END as matches_check
FROM matches;

-- Check if user profiles table exists and is accessible
SELECT 
  CASE 
    WHEN COUNT(*) >= 0 THEN 'PASS: User profiles table accessible'
    ELSE 'FAIL: User profiles table issue'
  END as profiles_check
FROM user_profiles;

-- Summary
SELECT 'DEPLOYMENT READINESS SUMMARY' as summary;
