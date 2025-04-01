-- Create channels table
CREATE TABLE IF NOT EXISTS public.channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  logo text,
  group_name text,
  type text NOT NULL DEFAULT 'live',
  description text,
  year integer,
  rating text,
  duration integer,
  genres text[],
  cast_members text[],
  director text,
  country text,
  language text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(name, url)
);

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Channels are viewable by everyone" ON public.channels
  FOR SELECT USING (true);

CREATE POLICY "Channels are insertable by authenticated users" ON public.channels
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Channels are updatable by authenticated users" ON public.channels
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Channels are deletable by authenticated users" ON public.channels
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS channels_name_idx ON public.channels (name);
CREATE INDEX IF NOT EXISTS channels_type_idx ON public.channels (type);
CREATE INDEX IF NOT EXISTS channels_group_idx ON public.channels (group_name);

-- Create function to handle channel updates
CREATE OR REPLACE FUNCTION public.handle_channel_updated()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for channel updates
DROP TRIGGER IF EXISTS on_channel_updated on public.channels;
CREATE TRIGGER on_channel_updated
  BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION public.handle_channel_updated();
