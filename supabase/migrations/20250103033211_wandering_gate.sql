-- Drop existing policies
DROP POLICY IF EXISTS "Admins podem ver outros admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins podem gerenciar admins" ON admin_users;

-- Create new simplified policies
CREATE POLICY "Admins podem ver outros admins"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins podem gerenciar admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      INNER JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid()
      AND ar.name = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      INNER JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

-- Garante que o super_admin role existe
INSERT INTO admin_roles (name, permissions)
VALUES ('super_admin', '{*}')
ON CONFLICT (name) DO NOTHING;

-- Adiciona o usuário como super admin
DO $$ 
DECLARE
  v_role_id uuid;
  v_user_id uuid;
BEGIN
  -- Get role_id
  SELECT id INTO v_role_id FROM admin_roles WHERE name = 'super_admin';
  
  -- Get user_id
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'meu.lado.cafajeste@gmail.com';

  -- Add as super admin if not already
  IF v_role_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    INSERT INTO admin_users (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;