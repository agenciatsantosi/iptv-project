-- Remover políticas existentes
drop policy if exists "Avatar upload policy" on storage.objects;
drop policy if exists "Avatar update policy" on storage.objects;
drop policy if exists "Avatar delete policy" on storage.objects;
drop policy if exists "Avatar public read policy" on storage.objects;

-- Criar bucket para avatares se não existir
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Habilitar RLS
alter table storage.objects enable row level security;

-- Criar política para permitir upload de avatares apenas pelo próprio usuário
create policy "Avatar upload policy"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Criar política para permitir atualização de avatares apenas pelo próprio usuário
create policy "Avatar update policy"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Criar política para permitir deleção de avatares apenas pelo próprio usuário
create policy "Avatar delete policy"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Criar política para permitir leitura pública dos avatares
create policy "Avatar public read policy"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- Garantir que o bucket está acessível
grant usage on schema storage to public;
grant select on storage.buckets to public;
grant select on storage.objects to public;
grant insert, update, delete on storage.objects to authenticated;
