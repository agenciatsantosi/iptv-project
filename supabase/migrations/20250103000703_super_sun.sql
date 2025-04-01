/*
  # Ajuste nas políticas de autenticação

  1. Alterações
    - Adiciona coluna email na tabela profiles
    - Atualiza políticas para melhor controle de acesso
    - Adiciona índice em email para performance

  2. Segurança
    - Mantém RLS ativo
    - Restringe acesso apenas ao próprio perfil do usuário
*/

-- Adiciona coluna email se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
    CREATE UNIQUE INDEX idx_profiles_email ON profiles(email);
  END IF;
END $$;

-- Atualiza políticas
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem ler seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ler seu próprio perfil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Adiciona política para atualização
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);