/*
  # Adiciona sistema de reações e comentários

  1. Novas Tabelas
    - `reactions` - Armazena reações dos usuários (like, love, etc)
    - `comments` - Armazena comentários dos usuários
    - `ratings` - Armazena avaliações com estrelas

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para leitura/escrita apenas de dados próprios
*/

-- Reactions
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'love', 'wow', 'haha', 'sad', 'angry')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_content_reaction UNIQUE (user_id, content_id)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver reações"
  ON reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem gerenciar suas reações"
  ON reactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver comentários"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem gerenciar seus comentários"
  ON comments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_content_rating UNIQUE (user_id, content_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver avaliações"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem gerenciar suas avaliações"
  ON ratings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reactions_content_id ON reactions(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_content_id ON comments(content_id);
CREATE INDEX IF NOT EXISTS idx_ratings_content_id ON ratings(content_id);

-- Trigger para updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();