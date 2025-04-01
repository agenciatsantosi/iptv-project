-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admins podem ver outros admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins podem gerenciar admins" ON admin_users;

-- Create simplified policies without circular dependencies
CREATE POLICY "Admins podem ver outros admins"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      INNER JOIN admin_users au ON au.role_id = ar.id
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins podem gerenciar admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      INNER JOIN admin_users au ON au.role_id = ar.id
      WHERE au.user_id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

-- Ensure super_admin role exists
INSERT INTO admin_roles (name, permissions)
VALUES ('super_admin', '{*}')
ON CONFLICT (name) DO NOTHING;

-- Add initial super admin user if exists
DO $$ 
DECLARE
  v_role_id uuid;
  v_user_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM admin_roles WHERE name = 'super_admin';
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'meu.lado.cafajeste@gmail.com';

  IF v_role_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    INSERT INTO admin_users (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- Create index to improve policy performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_name ON admin_roles(name);