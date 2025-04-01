-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir acesso
GRANT ALL ON public.profiles TO authenticated;

-- Copiar usuários existentes do auth para profiles
INSERT INTO public.profiles (user_id, email)
SELECT 
    id as user_id,
    email
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email;

-- Mostrar usuários
SELECT * FROM public.profiles;
