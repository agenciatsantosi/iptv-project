-- Remover todas as políticas e restrições primeiro
ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos podem ver admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Apenas admins podem modificar admin_users" ON public.admin_users;

-- Garantir acesso total
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON public.roles TO authenticated;

-- Inserir você como admin (vai funcionar mesmo que já exista)
WITH role_id AS (
  SELECT id FROM public.roles WHERE name = 'super_admin'
)
INSERT INTO public.admin_users (user_id, role_id)
SELECT 
  auth.uid(),
  role_id.id
FROM role_id
ON CONFLICT DO NOTHING;
