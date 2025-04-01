-- Mostrar seu user_id atual
SELECT id as seu_user_id FROM auth.users WHERE email = current_user;

-- Pegar o ID do papel super_admin
WITH role AS (
    SELECT id as role_id FROM public.roles WHERE name = 'super_admin'
)
INSERT INTO public.admin_users (user_id, role_id)
SELECT 
    (SELECT id FROM auth.users WHERE email = current_user) as user_id,
    role.role_id
FROM role
ON CONFLICT DO NOTHING;

-- Verificar se você está na tabela admin_users
SELECT 
    au.id as admin_id,
    au.user_id,
    au.role_id,
    r.name as role_name,
    u.email
FROM public.admin_users au
JOIN auth.users u ON u.id = au.user_id
JOIN public.roles r ON r.id = au.role_id
WHERE u.email = current_user;
