/*
  # Ajuste nas políticas de segurança dos perfis

  1. Alterações
    - Adiciona política para inserção de perfis
    - Corrige política de leitura para permitir busca por user_id
    - Adiciona índice em user_id para melhor performance

  2. Segurança
    - Mantém RLS ativo
    - Permite que usuários autenticados criem seus próprios perfis
    - Restringe acesso apenas ao próprio perfil do usuário
*/

-- Adiciona política para inserção de perfis
CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Atualiza política de leitura para permitir busca por user_id
DROP POLICY IF EXISTS "Usuários podem ler seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ler seu próprio perfil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = profiles.user_id AND id = auth.uid()
    )
  );

-- Adiciona índice para melhorar performance das buscas
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);