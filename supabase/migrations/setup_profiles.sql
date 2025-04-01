-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Usuários podem ver seus próprios perfis'
    ) THEN
        CREATE POLICY "Usuários podem ver seus próprios perfis"
        ON public.profiles FOR SELECT USING (
            auth.uid() = user_id
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE policyname = 'Usuários podem atualizar seus próprios perfis'
    ) THEN
        CREATE POLICY "Usuários podem atualizar seus próprios perfis"
        ON public.profiles FOR UPDATE USING (
            auth.uid() = user_id
        );
    END IF;
END $$;

-- Garantir acesso
GRANT ALL ON public.profiles TO authenticated;

-- Criar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para criar perfil quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
