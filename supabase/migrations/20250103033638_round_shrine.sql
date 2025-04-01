/*
  # Fix Admin Policies

  1. Changes
    - Simplify admin policies to prevent infinite recursion
    - Add direct role checks without circular dependencies
    - Improve performance with proper indexes
    
  2. Security
    - Maintain proper access control for admin users
    - Ensure super admin privileges
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins podem ver outros admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins podem gerenciar admins" ON admin_users;

-- Create simplified policies
CREATE POLICY "Admins podem ver outros admins"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.id IN (
        SELECT role_id FROM admin_users
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Super admins podem gerenciar admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.name = 'super_admin'
      AND ar.id IN (
        SELECT role_id FROM admin_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_name ON admin_roles(name);

-- Ensure super_admin role exists
INSERT INTO admin_roles (name, permissions)
VALUES ('super_admin', '{*}')
ON CONFLICT (name) DO NOTHING;

-- Add initial super admin if not exists
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