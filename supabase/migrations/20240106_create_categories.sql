-- Create categories table
create table if not exists public.categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create channel_categories junction table for many-to-many relationship
create table if not exists public.channel_categories (
    channel_id uuid references public.channels(id) on delete cascade,
    category_id uuid references public.categories(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (channel_id, category_id)
);

-- Add RLS policies
alter table public.categories enable row level security;
alter table public.channel_categories enable row level security;

-- Policies for categories
create policy "Enable read access for all users"
    on public.categories for select
    using (true);

create policy "Enable insert for authenticated users only"
    on public.categories for insert
    with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only"
    on public.categories for update
    using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
    on public.categories for delete
    using (auth.role() = 'authenticated');

-- Policies for channel_categories
create policy "Enable read access for all users"
    on public.channel_categories for select
    using (true);

create policy "Enable insert for authenticated users only"
    on public.channel_categories for insert
    with check (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only"
    on public.channel_categories for delete
    using (auth.role() = 'authenticated');
