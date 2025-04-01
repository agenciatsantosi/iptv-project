-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de roles para todos" ON public.roles;
DROP POLICY IF EXISTS "Permitir modificação de roles apenas para admins" ON public.roles;
DROP POLICY IF EXISTS "Permitir leitura de admin_users para todos" ON public.admin_users;
DROP POLICY IF EXISTS "Permitir modificação de admin_users apenas para admins" ON public.admin_users;

-- Criar novas políticas sem recursão
-- Políticas para roles
CREATE POLICY "Permitir leitura de roles para todos"
    ON public.roles FOR SELECT
    USING (true);

CREATE POLICY "Permitir modificação de roles para super_admin"
    ON public.roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            JOIN public.roles r ON au.role_id = r.id
            WHERE au.user_id = auth.uid()
            AND r.name = 'super_admin'
        )
    );

-- Políticas para admin_users
CREATE POLICY "Permitir leitura de admin_users para todos"
    ON public.admin_users FOR SELECT
    USING (true);

CREATE POLICY "Permitir modificação de admin_users para super_admin"
    ON public.admin_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            JOIN public.roles r ON au.role_id = r.id
            WHERE au.user_id = auth.uid()
            AND r.name = 'super_admin'
        )
    );

-- Garantir que o super_admin existe
INSERT INTO public.roles (name, permissions)
VALUES ('super_admin', '["all"]'::jsonb)
ON CONFLICT (name) DO NOTHING;
