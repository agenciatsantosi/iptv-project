-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de canais
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    logo_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    is_working BOOLEAN DEFAULT true,
    last_checked TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Criar políticas para categorias
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Todos podem ver categorias'
    ) THEN
        CREATE POLICY "Todos podem ver categorias"
        ON public.categories FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem modificar categorias'
    ) THEN
        CREATE POLICY "Apenas admins podem modificar categorias"
        ON public.categories FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Criar políticas para canais
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Todos podem ver canais ativos'
    ) THEN
        CREATE POLICY "Todos podem ver canais ativos"
        ON public.channels FOR SELECT USING (
            status = 'active' OR
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem modificar canais'
    ) THEN
        CREATE POLICY "Apenas admins podem modificar canais"
        ON public.channels FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Garantir acesso
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.channels TO authenticated;

-- Inserir algumas categorias padrão
INSERT INTO public.categories (name, slug, description) VALUES
    ('Filmes', 'filmes', 'Canais de filmes'),
    ('Séries', 'series', 'Canais de séries'),
    ('Esportes', 'esportes', 'Canais de esportes'),
    ('Notícias', 'noticias', 'Canais de notícias'),
    ('Infantil', 'infantil', 'Canais infantis')
ON CONFLICT DO NOTHING;
