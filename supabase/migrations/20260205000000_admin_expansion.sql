-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  province TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Active RLS for cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active cities" ON public.cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to cities" ON public.cities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Active RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to safe settings" ON public.app_settings
  FOR SELECT USING (true); -- We might want to restrict this later, but for now public read is okay for client configs

CREATE POLICY "Allow admin full access to settings" ON public.app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signup_ip TEXT,
ADD COLUMN IF NOT EXISTS signup_country TEXT,
ADD COLUMN IF NOT EXISTS is_international BOOLEAN DEFAULT false;

-- Add tracking columns to verifications (snapshotting for the record)
ALTER TABLE public.verifications
ADD COLUMN IF NOT EXISTS submitter_ip TEXT,
ADD COLUMN IF NOT EXISTS submitter_country TEXT;

-- Insert default settings if not exists
INSERT INTO app_settings (key, value, description)
VALUES 
  ('commission_rate', '10', 'Percentage taken from bookings'),
  ('min_hourly_rate', '500', 'Minimum hourly rate for companions'),
  ('max_gallery_images', '5', 'Maximum images in gallery'),
  ('support_email', '"support@mytimeconnect.com"', 'Support contact email')
ON CONFLICT (key) DO NOTHING;
