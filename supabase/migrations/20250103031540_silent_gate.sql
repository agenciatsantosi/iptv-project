-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Usuários podem ler seus próprios favoritos" ON iptv_favorites;
  DROP POLICY IF EXISTS "Usuários podem inserir seus próprios favoritos" ON iptv_favorites;
  DROP POLICY IF EXISTS "Usuários podem deletar seus próprios favoritos" ON iptv_favorites;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create table if not exists
CREATE TABLE IF NOT EXISTS iptv_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_channel UNIQUE (user_id, channel_id)
);

-- Enable RLS
ALTER TABLE iptv_favorites ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Usuários podem ler seus próprios favoritos"
  ON iptv_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios favoritos"
  ON iptv_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios favoritos"
  ON iptv_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indices if they don't exist
CREATE INDEX IF NOT EXISTS idx_iptv_favorites_user_id ON iptv_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_iptv_favorites_channel_id ON iptv_favorites(channel_id);