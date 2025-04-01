-- Criar tabela de storage_items
CREATE TABLE IF NOT EXISTS public.storage_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NULL,
    size_mb NUMERIC NOT NULL,
    type TEXT NOT NULL,
    last_accessed TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    max_concurrent_streams INTEGER NOT NULL DEFAULT 5,
    default_stream_quality TEXT NOT NULL DEFAULT 'auto',
    cache_duration INTEGER NOT NULL DEFAULT 24,
    max_storage_gb INTEGER NOT NULL DEFAULT 100,
    auto_backup_enabled BOOLEAN NOT NULL DEFAULT true,
    backup_interval_hours INTEGER NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de backups
CREATE TABLE IF NOT EXISTS public.backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    size_mb NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    type TEXT NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de content_reports (denúncias)
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de system_events (logs)
CREATE TABLE IF NOT EXISTS public.system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.system_settings (
    max_concurrent_streams,
    default_stream_quality,
    cache_duration,
    max_storage_gb,
    auto_backup_enabled,
    backup_interval_hours
) VALUES (
    5,
    'auto',
    24,
    100,
    true,
    24
) ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.storage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- Criar políticas
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem ver storage_items'
    ) THEN
        CREATE POLICY "Apenas admins podem ver storage_items"
        ON public.storage_items FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem ver system_settings'
    ) THEN
        CREATE POLICY "Apenas admins podem ver system_settings"
        ON public.system_settings FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem ver backups'
    ) THEN
        CREATE POLICY "Apenas admins podem ver backups"
        ON public.backups FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Usuários podem criar reports'
    ) THEN
        CREATE POLICY "Usuários podem criar reports"
        ON public.content_reports FOR INSERT WITH CHECK (
            auth.uid() = reported_by
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Usuários podem ver seus próprios reports'
    ) THEN
        CREATE POLICY "Usuários podem ver seus próprios reports"
        ON public.content_reports FOR SELECT USING (
            auth.uid() = reported_by OR
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem atualizar reports'
    ) THEN
        CREATE POLICY "Apenas admins podem atualizar reports"
        ON public.content_reports FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Apenas admins podem ver system_events'
    ) THEN
        CREATE POLICY "Apenas admins podem ver system_events"
        ON public.system_events FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.admin_users au 
                WHERE au.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Garantir acesso
GRANT ALL ON public.storage_items TO authenticated;
GRANT ALL ON public.system_settings TO authenticated;
GRANT ALL ON public.backups TO authenticated;
GRANT ALL ON public.content_reports TO authenticated;
GRANT ALL ON public.system_events TO authenticated;
