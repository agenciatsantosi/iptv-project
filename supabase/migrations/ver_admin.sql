-- Ver seu user_id
SELECT id, email FROM auth.users WHERE email = current_user;

-- Ver se você está na tabela admin_users
SELECT 
    au.*,
    u.email,
    r.name as role_name
FROM public.admin_users au
JOIN auth.users u ON u.id = au.user_id
JOIN public.roles r ON r.id = au.role_id;
