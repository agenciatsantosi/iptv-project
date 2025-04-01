-- Drop existing policies
DROP POLICY IF EXISTS "Admins podem ver outros admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins podem gerenciar admins" ON admin_users;

-- Create new policies
CREATE POLICY "Admins podem ver outros admins"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au2
      WHERE au2.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins podem gerenciar admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au2
      INNER JOIN admin_roles ar ON au2.role_id = ar.id
      WHERE au2.user_id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );