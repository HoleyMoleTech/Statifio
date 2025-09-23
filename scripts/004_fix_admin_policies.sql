-- Fix infinite recursion in admin policies by dropping and recreating them properly

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can delete all users" ON users;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

-- Create a function to check admin status without causing recursion
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users au
    JOIN users u ON au.id = u.id
    WHERE au.id = user_id AND u.is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate admin policies using the function to avoid recursion
CREATE POLICY "Admins can view all users" ON users 
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update all users" ON users 
  FOR UPDATE USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete all users" ON users 
  FOR DELETE USING (is_admin_user(auth.uid()));

-- Admin policies for payments
CREATE POLICY "Admins can view all payments" ON payments 
  FOR SELECT USING (is_admin_user(auth.uid()));

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION is_admin_user(UUID) TO authenticated;
