-- Habilitar RLS na tabela admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Criar política para SELECT
DO $$ BEGIN
    DROP POLICY IF EXISTS "Todos podem ver admin_users" ON public.admin_users;
    CREATE POLICY "Todos podem ver admin_users"
    ON public.admin_users FOR SELECT
    USING (true);
END $$;

-- Criar política para INSERT/UPDATE/DELETE
DO $$ BEGIN
    DROP POLICY IF EXISTS "Apenas admins podem modificar admin_users" ON public.admin_users;
    CREATE POLICY "Apenas admins podem modificar admin_users"
    ON public.admin_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );
END $$;

-- Garantir que usuários autenticados podem acessar a tabela
GRANT ALL ON public.admin_users TO authenticated;

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'admin_users';
