
-- Drop the circular policy
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;

-- Also fix: admin policy on profiles should use a separate mechanism
-- We'll use a security definer function to avoid circular dependency
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate admin profile read policy using the function
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (is_admin() OR auth.uid() = id);

-- Fix admin registration policy to use the function too
DROP POLICY IF EXISTS "admin_select_all_registrations" ON registrations;
DROP POLICY IF EXISTS "admin_update_all_registrations" ON registrations;

CREATE POLICY "admin_select_all_registrations" ON registrations FOR SELECT
  TO authenticated USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "admin_update_all_registrations" ON registrations FOR UPDATE
  TO authenticated USING (is_admin() OR auth.uid() = user_id) WITH CHECK (is_admin() OR auth.uid() = user_id);
