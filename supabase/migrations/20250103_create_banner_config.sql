-- Create the banner_config table
create table if not exists public.banner_config (
    id bigint primary key,
    selected_groups text[] not null default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.banner_config enable row level security;

-- Allow read access to authenticated users
create policy "Allow read access to authenticated users"
    on public.banner_config
    for select
    to authenticated
    using (true);

-- Allow write access to authenticated users with admin role
create policy "Allow write access to admin users"
    on public.banner_config
    for all
    to authenticated
    using (
        exists (
            select 1 from auth.users
            where auth.users.id = auth.uid()
            and auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create trigger to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at
    before update on public.banner_config
    for each row
    execute function public.handle_updated_at();
