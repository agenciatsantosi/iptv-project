-- Drop existing tables and functions if they exist
drop function if exists increment_channel_views;
drop table if exists channels cascade;

-- Create channels table
create table channels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  url text not null,
  logo text,
  group_title text,
  views integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index idx_channels_views on channels(views desc);
create index idx_channels_group on channels(group_title);

-- Create function to increment views
create function increment_channel_views(channel_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update channels
  set views = views + 1,
      updated_at = now()
  where id = channel_id;
end;
$$;
