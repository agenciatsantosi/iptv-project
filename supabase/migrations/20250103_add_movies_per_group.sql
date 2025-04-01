-- Add movies_per_group column
alter table public.banner_config 
add column if not exists movies_per_group integer not null default 5;
