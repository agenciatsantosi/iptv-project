/*
  # Adição de Novas Funcionalidades

  1. Sistema de Recomendações
  2. Perfis de Usuário
  3. Controle Parental
  4. Recursos de Vídeo
  5. Recursos Sociais
  6. Offline
  7. Analytics
*/

-- Perfis de Usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  pin_code text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Controle Parental
CREATE TABLE IF NOT EXISTS parental_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  max_rating text,
  restricted_categories text[],
  pin_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE parental_controls ENABLE ROW LEVEL SECURITY;

-- Histórico de Visualização
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  watched_at timestamptz DEFAULT now(),
  progress float DEFAULT 0,
  completed boolean DEFAULT false
);

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Downloads Offline
CREATE TABLE IF NOT EXISTS offline_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE offline_content ENABLE ROW LEVEL SECURITY;

-- Analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança

-- User Profiles
CREATE POLICY "Usuários podem ler seus próprios perfis"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem gerenciar seus próprios perfis"
  ON user_profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Parental Controls
CREATE POLICY "Usuários podem gerenciar controles parentais"
  ON parental_controls FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Watch History
CREATE POLICY "Usuários podem ver e gerenciar seu histórico"
  ON watch_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Offline Content
CREATE POLICY "Usuários podem gerenciar conteúdo offline"
  ON offline_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Analytics
CREATE POLICY "Usuários podem registrar eventos"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_watch_history_profile_id ON watch_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_content_id ON watch_history(content_id);
CREATE INDEX IF NOT EXISTS idx_offline_content_profile_id ON offline_content(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- Funções

-- Função para recomendações baseadas no histórico
CREATE OR REPLACE FUNCTION get_recommendations(p_profile_id uuid)
RETURNS TABLE (content_id text, score float) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wh.content_id,
    count(*) as score
  FROM watch_history wh
  WHERE wh.profile_id = p_profile_id
  GROUP BY wh.content_id
  ORDER BY score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar restrições parentais
CREATE OR REPLACE FUNCTION check_content_restrictions(
  p_profile_id uuid,
  p_content_rating text,
  p_content_categories text[]
) RETURNS boolean AS $$
DECLARE
  v_max_rating text;
  v_restricted_categories text[];
BEGIN
  SELECT 
    max_rating,
    restricted_categories
  INTO 
    v_max_rating,
    v_restricted_categories
  FROM parental_controls
  WHERE profile_id = p_profile_id;

  -- Se não há controle parental, permite tudo
  IF v_max_rating IS NULL THEN
    RETURN true;
  END IF;

  -- Verifica rating
  IF p_content_rating > v_max_rating THEN
    RETURN false;
  END IF;

  -- Verifica categorias restritas
  IF v_restricted_categories && p_content_categories THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;