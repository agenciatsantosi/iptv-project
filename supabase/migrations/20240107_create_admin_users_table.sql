-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users are viewable by admins only" ON public.admin_users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );

CREATE POLICY "Admin users are insertable by admins only" ON public.admin_users
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );

CREATE POLICY "Admin users are updatable by admins only" ON public.admin_users
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );

CREATE POLICY "Admin users are deletable by admins only" ON public.admin_users
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );

-- Create first admin user (replace USER_ID with your user's ID)
-- INSERT INTO public.admin_users (user_id) VALUES ('YOUR-USER-ID-HERE');
