-- Listar e remover todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop todas as políticas em admin_users
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'admin_users'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', r.policyname);
    END LOOP;

    -- Drop todas as políticas em roles
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'roles'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.roles', r.policyname);
    END LOOP;
END $$;

-- Dropar tabelas existentes
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

-- Criar tabela de admin_users
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Desabilitar RLS completamente
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Garantir que todos têm acesso
GRANT ALL ON public.roles TO anon, authenticated;
GRANT ALL ON public.admin_users TO anon, authenticated;

-- Verificar se existem políticas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('admin_users', 'roles');
