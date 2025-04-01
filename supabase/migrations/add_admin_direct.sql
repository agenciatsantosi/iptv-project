-- Substitua SEU_USER_ID_AQUI pelo ID que você copiou do painel
INSERT INTO public.admin_users (user_id, role_id)
SELECT 
  'SEU_USER_ID_AQUI'::uuid as user_id,
  roles.id as role_id
FROM public.roles 
WHERE roles.name = 'super_admin'
ON CONFLICT DO NOTHING;
