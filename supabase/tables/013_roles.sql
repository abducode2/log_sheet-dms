
-- Ensure profiles table has role column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer' 
  CHECK (role IN ('admin', 'editor', 'viewer'));

-- RLS: Allow users to read their own profile
DROP POLICY IF EXISTS "Own profile" ON profiles;
CREATE POLICY "Own profile read" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own profile update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
