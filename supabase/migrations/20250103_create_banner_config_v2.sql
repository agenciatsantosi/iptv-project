-- Drop existing table if exists
drop table if exists public.banner_config;

-- Create the banner_config table
create table public.banner_config (
    id bigint primary key,
    selected_groups text[] not null default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.banner_config enable row level security;

-- Allow read/write access to all authenticated users
create policy "Allow full access to authenticated users"
    on public.banner_config
    for all
    to authenticated
    using (true)
    with check (true);

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
