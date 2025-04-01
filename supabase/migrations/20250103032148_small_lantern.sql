/*
  # Sistema de Administração

  1. Tabelas
    - admin_roles: Papéis de administrador
    - admin_permissions: Permissões específicas
    - admin_audit_logs: Logs de auditoria
  
  2. Funções
    - check_admin_permission: Verifica permissões
    - log_admin_action: Registra ações
*/

-- Roles (Papéis)
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES admin_roles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_admin_user UNIQUE (user_id)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Apenas admins podem ver roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins podem gerenciar roles"
  ON admin_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      INNER JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid()
      AND ar.name = 'super_admin'
    )
  );

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
  );

CREATE POLICY "Admins podem ver logs"
  ON admin_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Funções
CREATE OR REPLACE FUNCTION check_admin_permission(p_user_id uuid, p_permission text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_users au
    INNER JOIN admin_roles ar ON au.role_id = ar.id
    WHERE au.user_id = p_user_id
    AND (
      ar.name = 'super_admin'
      OR p_permission = ANY(ar.permissions)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_admin_action(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_changes jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Get admin_id
  SELECT id INTO v_admin_id
  FROM admin_users
  WHERE user_id = auth.uid();

  -- Insert log
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    v_admin_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_changes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default super admin role
INSERT INTO admin_roles (name, permissions)
VALUES ('super_admin', '{*}')
ON CONFLICT (name) DO NOTHING;