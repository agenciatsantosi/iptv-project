-- Primeiro, vamos dropar as tabelas existentes se houver
DROP TABLE IF EXISTS public.admin_users;
DROP TABLE IF EXISTS public.roles;

-- Criar tabela de roles (papéis) primeiro
CREATE TABLE public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de admin_users com a referência correta
CREATE TABLE public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
DROP POLICY IF EXISTS "Permitir leitura de roles para todos" ON public.roles;
CREATE POLICY "Permitir leitura de roles para todos"
    ON public.roles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir modificação de roles apenas para admins" ON public.roles;
CREATE POLICY "Permitir modificação de roles apenas para admins"
    ON public.roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Permitir leitura de admin_users para todos" ON public.admin_users;
CREATE POLICY "Permitir leitura de admin_users para todos"
    ON public.admin_users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir modificação de admin_users apenas para admins" ON public.admin_users;
CREATE POLICY "Permitir modificação de admin_users apenas para admins"
    ON public.admin_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Inserir papel super_admin
INSERT INTO public.roles (name, permissions)
VALUES ('super_admin', '["all"]'::jsonb)
ON CONFLICT (name) DO NOTHING;
