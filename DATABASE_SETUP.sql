-- ============================================
-- MYTIME CONNECT - Complete Database Setup
-- ============================================
-- This file contains all SQL needed to recreate 
-- the database in a new Supabase environment.
-- Run these in order in the Supabase SQL Editor.
-- ============================================

-- ============================================
-- PART 1: ENUMS
-- ============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TYPE public.booking_status AS ENUM (
  'pending', 
  'accepted', 
  'rejected', 
  'active', 
  'completed', 
  'cancelled'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending', 
  'requested', 
  'paid', 
  'confirmed', 
  'disputed'
);

CREATE TYPE public.complaint_status AS ENUM (
  'open', 
  'investigating', 
  'resolved', 
  'dismissed'
);

CREATE TYPE public.complaint_type AS ENUM (
  'payment_not_received',
  'misbehavior',
  'no_show',
  'harassment',
  'rule_violation',
  'other'
);

CREATE TYPE public.verification_status AS ENUM (
  'pending', 
  'approved', 
  'rejected'
);

-- ============================================
-- PART 2: TABLES
-- ============================================

-- Profiles table (main user profiles)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT false,
  city TEXT,
  area TEXT,
  profession TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_companion BOOLEAN DEFAULT false,
  is_identity_verified BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  consent_accepted BOOLEAN DEFAULT false,
  consent_accepted_at TIMESTAMP WITH TIME ZONE,
  identity_verified_at TIMESTAMP WITH TIME ZONE,
  identity_verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Companion profiles (extended data for companions)
CREATE TABLE public.companion_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  hourly_rate INTEGER NOT NULL DEFAULT 500,
  activities TEXT[] DEFAULT '{}',
  gallery_images TEXT[] DEFAULT '{}',
  availability_status BOOLEAN DEFAULT false,
  average_rating NUMERIC DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  payment_method TEXT,
  payment_qr_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  companion_id UUID NOT NULL REFERENCES public.profiles(id),
  booking_date DATE NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  duration_hours INTEGER NOT NULL,
  hourly_rate INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  activity TEXT NOT NULL,
  location TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  user_notes TEXT,
  companion_notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chats table (for booking-based messaging)
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id),
  user_id UUID NOT NULL,
  companion_id UUID NOT NULL REFERENCES public.profiles(id),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  grace_period_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment requests table
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  companion_id UUID NOT NULL REFERENCES public.profiles(id),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'requested',
  payment_method TEXT,
  payment_qr_url TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  companion_profile_id UUID NOT NULL REFERENCES public.companion_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, companion_profile_id)
);

-- Blocks table
CREATE TABLE public.blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Verifications table (ID verification submissions)
CREATE TABLE public.verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  full_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_number TEXT,
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  status public.verification_status NOT NULL DEFAULT 'pending',
  reviewer_id UUID,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  complaint_type public.complaint_type NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status public.complaint_status NOT NULL DEFAULT 'open',
  assigned_to UUID,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin audit logs table
CREATE TABLE public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PART 3: DATABASE FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user creation (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Function to protect sensitive profile fields
CREATE OR REPLACE FUNCTION public.profiles_protect_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins/moderators can change verification flags
  IF (NEW.is_identity_verified IS DISTINCT FROM OLD.is_identity_verified)
     OR (NEW.is_verified IS DISTINCT FROM OLD.is_verified) THEN
    IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)) THEN
      RAISE EXCEPTION 'Not allowed to change verification flags';
    END IF;
  END IF;

  -- After identity verification, lock name changes for non-admin/moderator
  IF OLD.is_identity_verified = true THEN
    IF (NEW.first_name IS DISTINCT FROM OLD.first_name)
       OR (NEW.last_name IS DISTINCT FROM OLD.last_name) THEN
      IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)) THEN
        RAISE EXCEPTION 'Name cannot be changed after identity verification';
      END IF;
    END IF;
  END IF;

  -- Maintain metadata when toggling identity verification
  IF (NEW.is_identity_verified = true AND OLD.is_identity_verified = false) THEN
    NEW.identity_verified_at = now();
    NEW.identity_verified_by = auth.uid();
  ELSIF (NEW.is_identity_verified = false AND OLD.is_identity_verified = true) THEN
    NEW.identity_verified_at = NULL;
    NEW.identity_verified_by = NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- PART 4: TRIGGERS
-- ============================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to protect sensitive profile fields
CREATE TRIGGER profiles_protect_sensitive_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_protect_sensitive_fields();

-- Update timestamps triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_companion_profiles_updated_at
  BEFORE UPDATE ON public.companion_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- PART 5: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- USER ROLES POLICIES
-- ============================================

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- COMPANION PROFILES POLICIES
-- ============================================

CREATE POLICY "Public companion profiles are viewable by everyone"
  ON public.companion_profiles FOR SELECT
  USING (true);

CREATE POLICY "Companions can insert own profile"
  ON public.companion_profiles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = companion_profiles.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Companions can update own profile"
  ON public.companion_profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = companion_profiles.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = bookings.companion_id
      AND profiles.user_id = auth.uid()
    )) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Booking participants can update"
  ON public.bookings FOR UPDATE
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = bookings.companion_id
      AND profiles.user_id = auth.uid()
    )) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- ============================================
-- CHATS POLICIES
-- ============================================

CREATE POLICY "Chat participants can view"
  ON public.chats FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = chats.companion_id
      AND profiles.user_id = auth.uid()
    ))
  );

CREATE POLICY "Booking participants can create chats"
  ON public.chats FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = chats.companion_id
      AND profiles.user_id = auth.uid()
    ))
  );

CREATE POLICY "Chat participants can update chats"
  ON public.chats FOR UPDATE
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = chats.companion_id
      AND profiles.user_id = auth.uid()
    ))
  );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

CREATE POLICY "Chat participants can view messages"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = messages.chat_id
    AND (
      (auth.uid() = chats.user_id) OR
      (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = chats.companion_id
        AND profiles.user_id = auth.uid()
      ))
    )
  ));

CREATE POLICY "Chat participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = messages.chat_id
    AND chats.is_active = true
    AND (now() >= chats.starts_at AND now() <= chats.grace_period_ends_at)
    AND (
      (auth.uid() = chats.user_id) OR
      (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = chats.companion_id
        AND profiles.user_id = auth.uid()
      ))
    )
  ));

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- PAYMENT REQUESTS POLICIES
-- ============================================

CREATE POLICY "Booking participants can view payment requests"
  ON public.payment_requests FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = payment_requests.companion_id
      AND profiles.user_id = auth.uid()
    )) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Companions can create payment requests"
  ON public.payment_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = payment_requests.companion_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Participants can update payment requests"
  ON public.payment_requests FOR UPDATE
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = payment_requests.companion_id
      AND profiles.user_id = auth.uid()
    ))
  );

-- ============================================
-- FAVORITES POLICIES
-- ============================================

CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- BLOCKS POLICIES
-- ============================================

CREATE POLICY "Users can view own blocks"
  ON public.blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
  ON public.blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks"
  ON public.blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- ============================================
-- VERIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own verifications"
  ON public.verifications FOR SELECT
  USING (
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = verifications.profile_id
      AND profiles.user_id = auth.uid()
    )) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can insert own verifications"
  ON public.verifications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = verifications.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Admins can update verifications"
  ON public.verifications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete verifications"
  ON public.verifications FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- COMPLAINTS POLICIES
-- ============================================

CREATE POLICY "Users can view own complaints"
  ON public.complaints FOR SELECT
  USING (
    (auth.uid() = reporter_id) OR
    (auth.uid() = reported_user_id) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'moderator'::app_role)
  );

CREATE POLICY "Users can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update complaints"
  ON public.complaints FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'moderator'::app_role)
  );

-- ============================================
-- ADMIN AUDIT LOGS POLICIES
-- ============================================

CREATE POLICY "Only admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can create audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- PART 6: STORAGE BUCKETS
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('verifications', 'verifications', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-qr', 'payment-qr', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for gallery bucket
CREATE POLICY "Gallery images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Users can upload to gallery"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update gallery images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for verifications bucket (private)
CREATE POLICY "Users can upload verification documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own verification documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verifications' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role))
  );

-- Storage policies for payment-qr bucket
CREATE POLICY "Payment QR images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-qr');

CREATE POLICY "Users can upload payment QR"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-qr' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update payment QR"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'payment-qr' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for evidence bucket (private)
CREATE POLICY "Users can upload evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'evidence' AND auth.uid() IS NOT NULL);

CREATE POLICY "Evidence viewable by admins and participants"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evidence' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role))
  );

-- ============================================
-- PART 7: REALTIME
-- ============================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;

-- ============================================
-- PART 8: INDEXES (Performance)
-- ============================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_is_companion ON public.profiles(is_companion);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_companion_profiles_profile_id ON public.companion_profiles(profile_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_companion_id ON public.bookings(companion_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_chats_booking_id ON public.chats(booking_id);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_verifications_profile_id ON public.verifications(profile_id);
CREATE INDEX idx_verifications_status ON public.verifications(status);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- After running this SQL:
-- 1. Set up your Supabase project URL and anon key in .env
-- 2. Configure email templates in Supabase Dashboard
-- 3. Create your first admin user manually:
--    INSERT INTO public.user_roles (user_id, role) 
--    VALUES ('your-user-uuid', 'admin');
-- ============================================
