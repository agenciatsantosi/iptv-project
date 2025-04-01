-- Remover objetos existentes
DROP FUNCTION IF EXISTS public.log_event(UUID, TEXT, TEXT, TEXT, JSONB, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.log_event(UUID, TEXT, JSONB, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.start_viewing_session(UUID, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.start_viewing_session(UUID, TEXT, TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.end_viewing_session(UUID, INTEGER, INTEGER) CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.viewing_sessions CASCADE;
DROP TABLE IF EXISTS public.daily_metrics CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP VIEW IF EXISTS public.popular_content CASCADE;

-- Criar tabelas de analytics
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar tabela de eventos
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  device_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar tabela de sessões de visualização
CREATE TABLE IF NOT EXISTS public.viewing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration INTERVAL,
  quality TEXT,
  buffering_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  device_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar tabela de roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir role padrão de super_admin
INSERT INTO public.roles (name, permissions)
VALUES ('super_admin', '["all"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Criar view de conteúdo popular
CREATE OR REPLACE VIEW public.popular_content AS
SELECT 
  content_id,
  content_type,
  COUNT(*) as view_count,
  AVG(EXTRACT(EPOCH FROM duration)) as avg_duration_seconds,
  SUM(buffering_count) as total_buffering,
  SUM(error_count) as total_errors
FROM public.viewing_sessions
WHERE end_time IS NOT NULL
GROUP BY content_id, content_type
ORDER BY view_count DESC;

-- Função para registrar eventos
CREATE OR REPLACE FUNCTION public.log_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_device_info JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.events (user_id, event_type, event_data, device_info)
  VALUES (p_user_id, p_event_type, p_event_data, p_device_info)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Função para iniciar sessão de visualização
CREATE OR REPLACE FUNCTION public.start_viewing_session(
  p_user_id UUID,
  p_content_id TEXT,
  p_content_type TEXT,
  p_quality TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO public.viewing_sessions (
    user_id,
    content_id,
    content_type,
    quality,
    device_info
  )
  VALUES (
    p_user_id,
    p_content_id,
    p_content_type,
    p_quality,
    p_device_info
  )
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$;

-- Função para finalizar sessão de visualização
CREATE OR REPLACE FUNCTION public.end_viewing_session(
  p_session_id UUID,
  p_buffering_count INTEGER DEFAULT 0,
  p_error_count INTEGER DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.viewing_sessions
  SET
    end_time = NOW(),
    duration = NOW() - start_time,
    buffering_count = p_buffering_count,
    error_count = p_error_count,
    updated_at = NOW()
  WHERE id = p_session_id;
END;
$$;

-- Permissões
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Acesso apenas para admins"
ON public.daily_metrics
FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

CREATE POLICY "Acesso apenas para admins"
ON public.events
FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

CREATE POLICY "Acesso apenas para admins"
ON public.viewing_sessions
FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

CREATE POLICY "Acesso apenas para admins"
ON public.roles
FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Grants
GRANT ALL ON public.daily_metrics TO authenticated;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.viewing_sessions TO authenticated;
GRANT ALL ON public.roles TO authenticated;
GRANT ALL ON public.popular_content TO authenticated;

GRANT EXECUTE ON FUNCTION public.log_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_viewing_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_viewing_session TO authenticated;

-- Inserir dados de exemplo
INSERT INTO public.daily_metrics (date, metric_type, metric_value) VALUES
  (CURRENT_DATE - 6, 'views', 150),
  (CURRENT_DATE - 6, 'users', 45),
  (CURRENT_DATE - 5, 'views', 200),
  (CURRENT_DATE - 5, 'users', 60),
  (CURRENT_DATE - 4, 'views', 180),
  (CURRENT_DATE - 4, 'users', 55),
  (CURRENT_DATE - 3, 'views', 250),
  (CURRENT_DATE - 3, 'users', 75),
  (CURRENT_DATE - 2, 'views', 300),
  (CURRENT_DATE - 2, 'users', 90),
  (CURRENT_DATE - 1, 'views', 280),
  (CURRENT_DATE - 1, 'users', 85),
  (CURRENT_DATE, 'views', 320),
  (CURRENT_DATE, 'users', 95);

-- Inserir algumas sessões de visualização
INSERT INTO public.viewing_sessions (
  content_id,
  content_type,
  start_time,
  end_time,
  duration,
  quality,
  buffering_count,
  error_count
) VALUES
  ('movie-1', 'movie', now() - interval '2 hours', now() - interval '30 minutes', interval '90 minutes', 'hd', 2, 0),
  ('series-1', 'series', now() - interval '1 day', now() - interval '23 hours', interval '60 minutes', 'hd', 1, 1),
  ('channel-1', 'channel', now() - interval '4 hours', now() - interval '3 hours', interval '60 minutes', 'hd', 0, 0);
