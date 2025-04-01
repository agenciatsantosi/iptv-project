/*
  # Esquema inicial do banco de dados

  1. Novas Tabelas
    - `profiles`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência para auth.users)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `watchlist`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência para auth.users)
      - `content_id` (text)
      - `content_type` (text)
      - `created_at` (timestamp)
    
    - `watch_progress`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência para auth.users)
      - `content_id` (text)
      - `progress` (float)
      - `updated_at` (timestamp)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para leitura e escrita apenas dos próprios dados do usuário
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ler seu próprio perfil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  content_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_content UNIQUE (user_id, content_id)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ler sua própria lista"
  ON watchlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar sua própria lista"
  ON watchlist
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Watch Progress
CREATE TABLE IF NOT EXISTS watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  progress float NOT NULL,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_content_progress UNIQUE (user_id, content_id)
);

ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ler seu próprio progresso"
  ON watch_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso"
  ON watch_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_watch_progress_updated_at
  BEFORE UPDATE ON watch_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();