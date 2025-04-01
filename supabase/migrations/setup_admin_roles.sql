-- Criar tabela de papéis (roles)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de usuários admin
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Criar políticas para roles
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Todos podem ver roles'
    ) THEN
        CREATE POLICY "Todos podem ver roles"
        ON public.roles FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem modificar roles'
    ) THEN
        CREATE POLICY "Apenas admins podem modificar roles"
        ON public.roles FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Criar políticas para admin_users
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem ver admin_users'
    ) THEN
        CREATE POLICY "Apenas admins podem ver admin_users"
        ON public.admin_users FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem modificar admin_users'
    ) THEN
        CREATE POLICY "Apenas admins podem modificar admin_users"
        ON public.admin_users FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Garantir acesso
GRANT ALL ON public.roles TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;

-- Inserir papéis padrão
INSERT INTO public.roles (name) VALUES
    ('super_admin'),
    ('admin')
ON CONFLICT DO NOTHING;

-- Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users au 
        WHERE au.user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
