-- Remover RLS da tabela admin_users
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Garantir que usuários autenticados podem ler a tabela
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.roles TO authenticated;

-- Verificar se você está na tabela
SELECT * FROM public.admin_users WHERE user_id = '39c0fc64-6182-4fc5-ab95-1534a2bdaba3';
