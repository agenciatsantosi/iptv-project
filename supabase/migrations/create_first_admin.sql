-- Pegar o ID do papel super_admin
DO $$ 
DECLARE
    role_id UUID;
    user_id UUID := 'COLOQUE_SEU_USER_ID_AQUI'; -- Substitua pelo seu user_id
BEGIN
    -- Pegar o ID do papel super_admin
    SELECT id INTO role_id FROM public.roles WHERE name = 'super_admin';
    
    -- Criar o primeiro admin
    INSERT INTO public.admin_users (user_id, role_id)
    VALUES (user_id, role_id)
    ON CONFLICT DO NOTHING;
END $$;
