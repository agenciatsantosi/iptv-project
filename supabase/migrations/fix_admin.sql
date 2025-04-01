-- Primeiro, vamos buscar o ID do papel super_admin
WITH role AS (
  SELECT id FROM public.roles WHERE name = 'super_admin'
)
INSERT INTO public.admin_users (user_id, role_id)
SELECT 
  auth.uid() as user_id,  -- Isso pega o ID do usuário atual
  role.id as role_id
FROM role
ON CONFLICT DO NOTHING;
