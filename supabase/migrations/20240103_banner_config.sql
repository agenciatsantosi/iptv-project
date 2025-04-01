-- Cria a tabela banner_config
create table if not exists public.banner_config (
    id bigint primary key,
    selected_groups text[] not null default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adiciona RLS (Row Level Security)
alter table public.banner_config enable row level security;

-- Políticas de segurança
create policy "Somente admins podem editar banner_config"
    on public.banner_config
    for all
    to authenticated
    using (
        exists (
            select 1 from auth.users
            where auth.users.id = auth.uid()
            and auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- Permite leitura pública
create policy "Qualquer um pode ler banner_config"
    on public.banner_config
    for select
    to anon, authenticated
    using (true);

-- Insere configuração padrão
insert into public.banner_config (id, selected_groups)
values (1, array['FILMES: LANÇAMENTOS 2024'])
on conflict (id) do nothing;
