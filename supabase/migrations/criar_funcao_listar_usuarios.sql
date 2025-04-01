-- Primeiro remover a função se ela existir
DROP FUNCTION IF EXISTS public.list_users();

-- Criar função para listar usuários
CREATE OR REPLACE FUNCTION public.list_users()
RETURNS TABLE (
    id uuid,
    email text,
    created_at timestamptz,
    is_admin boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Só retorna os usuários se quem chamou for admin
    IF EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    ) THEN
        RETURN QUERY 
        SELECT 
            au.id, 
            au.email::text, 
            au.created_at,
            EXISTS (
                SELECT 1 FROM public.admin_users au2 
                WHERE au2.user_id = au.id
            ) as is_admin
        FROM auth.users au;
    END IF;
END;
$$;

-- Dar acesso à função
GRANT EXECUTE ON FUNCTION public.list_users() TO authenticated;
