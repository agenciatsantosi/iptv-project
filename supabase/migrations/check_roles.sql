-- Verificar se a tabela roles existe
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Verificar se o papel super_admin existe
INSERT INTO public.roles (name, permissions)
SELECT 'super_admin', '{all}'
WHERE NOT EXISTS (
    SELECT 1 FROM public.roles WHERE name = 'super_admin'
);

-- Mostrar os papéis existentes
SELECT * FROM public.roles;
