-- Dropar tabelas existentes (isso vai dropar as políticas automaticamente)
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- Criar tabela de roles (papéis)
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de admin_users com a referência correta para roles
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o updated_at
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS simplificadas
-- Políticas para roles
CREATE POLICY "Permitir leitura de roles para todos"
    ON public.roles FOR SELECT
    USING (true);

CREATE POLICY "Permitir modificação de roles para super_admin"
    ON public.roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
            AND role_id IN (SELECT id FROM public.roles WHERE name = 'super_admin')
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
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
            AND role_id IN (SELECT id FROM public.roles WHERE name = 'super_admin')
        )
    );

-- Inserir papel super_admin
INSERT INTO public.roles (name, permissions)
VALUES ('super_admin', '["all"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Permitir acesso público às tabelas
GRANT ALL ON public.roles TO anon, authenticated;
GRANT ALL ON public.admin_users TO anon, authenticated;
