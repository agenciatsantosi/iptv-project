/*
  # IPTV Tables

  1. New Tables
    - `iptv_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `channel_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `iptv_favorites` table
    - Add policies for authenticated users
*/

-- IPTV Favorites
CREATE TABLE IF NOT EXISTS iptv_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_channel UNIQUE (user_id, channel_id)
);

-- Enable RLS
ALTER TABLE iptv_favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Usuários podem ler seus próprios favoritos"
  ON iptv_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar seus próprios favoritos"
  ON iptv_favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_iptv_favorites_user_id ON iptv_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_iptv_favorites_channel_id ON iptv_favorites(channel_id);