-- Create viewing history table
create table if not exists viewing_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  content_id text not null,
  content_type text not null,
  watched_at timestamp with time zone default now(),
  watch_duration integer,
  completed boolean default false
);

-- Create user preferences table
create table if not exists user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) unique,
  preferred_genres text[],
  content_language text default 'pt-BR',
  subtitle_language text default 'pt-BR',
  autoplay boolean default true,
  mature_content boolean default false,
  video_quality text default 'auto'
);

-- Create user profiles table
create table if not exists user_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) unique,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index if not exists idx_viewing_history_user_id on viewing_history(user_id);
create index if not exists idx_viewing_history_content_id on viewing_history(content_id);
