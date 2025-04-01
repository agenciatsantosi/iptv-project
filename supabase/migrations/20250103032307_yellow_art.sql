/*
  # Adiciona Super Admin

  1. Adiciona o usuário como super admin
  2. Garante que o papel super_admin existe
*/

-- Garante que o papel super_admin existe
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
  SELECT id INTO v_role_id
  FROM admin_roles
  WHERE name = 'super_admin';

  -- Get user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'meu.lado.cafajeste@gmail.com';

  -- Add as super admin
  INSERT INTO admin_users (user_id, role_id)
  VALUES (v_user_id, v_role_id)
  ON CONFLICT (user_id) DO NOTHING;
END $$;