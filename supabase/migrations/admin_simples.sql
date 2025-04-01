-- 1. Criar papel super_admin se não existir
INSERT INTO public.roles (name, permissions) 
VALUES ('super_admin', ARRAY['all'])
ON CONFLICT (name) DO NOTHING;

-- 2. Fazer você admin
INSERT INTO public.admin_users (user_id, role_id)
VALUES (
    (SELECT id FROM auth.users WHERE email = current_user), -- seu user_id
    (SELECT id FROM public.roles WHERE name = 'super_admin') -- role_id do super_admin
)
ON CONFLICT DO NOTHING;
