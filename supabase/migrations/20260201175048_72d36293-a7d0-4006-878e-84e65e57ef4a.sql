-- =====================================================
-- HANGOUTLY COMPLETE DATABASE SCHEMA
-- =====================================================

-- User Roles Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Verification Status Enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Booking Status Enum  
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled');

-- Payment Status Enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'requested', 'paid', 'confirmed', 'disputed');

-- Complaint Type Enum
CREATE TYPE public.complaint_type AS ENUM ('payment_not_received', 'misbehavior', 'no_show', 'harassment', 'rule_violation', 'other');

-- Complaint Status Enum
CREATE TYPE public.complaint_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');

-- =====================================================
-- 1. PROFILES TABLE (Core user information)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    phone TEXT,
    phone_verified BOOLEAN DEFAULT false,
    city TEXT,
    area TEXT,
    profession TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_companion BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    consent_accepted BOOLEAN DEFAULT false,
    consent_accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 2. USER ROLES TABLE (For role-based access)
-- =====================================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- =====================================================
-- 3. COMPANION PROFILES (Extended companion info)
-- =====================================================
CREATE TABLE public.companion_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    hourly_rate INTEGER NOT NULL DEFAULT 500,
    activities TEXT[] DEFAULT '{}',
    gallery_images TEXT[] DEFAULT '{}',
    availability_status BOOLEAN DEFAULT false,
    payment_qr_url TEXT,
    payment_method TEXT,
    total_bookings INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 4. VERIFICATIONS TABLE (ID verification)
-- =====================================================
CREATE TABLE public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT,
    document_front_url TEXT NOT NULL,
    document_back_url TEXT,
    selfie_url TEXT NOT NULL,
    status verification_status DEFAULT 'pending' NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id),
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 5. BOOKINGS TABLE (without generated column)
-- =====================================================
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    companion_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 8),
    activity TEXT NOT NULL,
    location TEXT,
    hourly_rate INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status booking_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    user_notes TEXT,
    companion_notes TEXT,
    cancelled_by UUID REFERENCES auth.users(id),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 6. PAYMENT REQUESTS TABLE
-- =====================================================
CREATE TABLE public.payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    companion_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    payment_qr_url TEXT,
    payment_method TEXT,
    requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    paid_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    status payment_status DEFAULT 'requested' NOT NULL
);

-- =====================================================
-- 7. CHATS TABLE (Time-locked conversations)
-- =====================================================
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    companion_id UUID REFERENCES public.profiles(id) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    grace_period_ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 8. MESSAGES TABLE
-- =====================================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 9. COMPLAINTS TABLE
-- =====================================================
CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) NOT NULL,
    reported_user_id UUID REFERENCES auth.users(id) NOT NULL,
    booking_id UUID REFERENCES public.bookings(id),
    complaint_type complaint_type NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status complaint_status DEFAULT 'open' NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 10. BLOCKS TABLE
-- =====================================================
CREATE TABLE public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES auth.users(id) NOT NULL,
    blocked_id UUID REFERENCES auth.users(id) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (blocker_id, blocked_id)
);

-- =====================================================
-- 11. FAVORITES TABLE
-- =====================================================
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    companion_profile_id UUID REFERENCES public.companion_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, companion_profile_id)
);

-- =====================================================
-- 12. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 13. ADMIN AUDIT LOGS
-- =====================================================
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECK
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- =====================================================
-- AUTO UPDATE TIMESTAMP FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_companion_profiles_updated_at BEFORE UPDATE ON public.companion_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON public.verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- AUTO CREATE PROFILE ON USER SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PROFILES
-- =====================================================
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - USER ROLES
-- =====================================================
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - COMPANION PROFILES
-- =====================================================
CREATE POLICY "Public companion profiles are viewable by everyone" ON public.companion_profiles
    FOR SELECT USING (true);

CREATE POLICY "Companions can update own profile" ON public.companion_profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = companion_profiles.profile_id AND user_id = auth.uid())
    );

CREATE POLICY "Companions can insert own profile" ON public.companion_profiles
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = companion_profiles.profile_id AND user_id = auth.uid())
    );

-- =====================================================
-- RLS POLICIES - VERIFICATIONS
-- =====================================================
CREATE POLICY "Users can view own verifications" ON public.verifications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = verifications.profile_id AND user_id = auth.uid())
        OR public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can insert own verifications" ON public.verifications
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = verifications.profile_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can update verifications" ON public.verifications
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - BOOKINGS
-- =====================================================
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = bookings.companion_id AND user_id = auth.uid())
        OR public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Booking participants can update" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = bookings.companion_id AND user_id = auth.uid())
        OR public.has_role(auth.uid(), 'admin')
    );

-- =====================================================
-- RLS POLICIES - PAYMENT REQUESTS
-- =====================================================
CREATE POLICY "Booking participants can view payment requests" ON public.payment_requests
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = payment_requests.companion_id AND user_id = auth.uid())
        OR public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Companions can create payment requests" ON public.payment_requests
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = payment_requests.companion_id AND user_id = auth.uid())
    );

CREATE POLICY "Participants can update payment requests" ON public.payment_requests
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = payment_requests.companion_id AND user_id = auth.uid())
    );

-- =====================================================
-- RLS POLICIES - CHATS
-- =====================================================
CREATE POLICY "Chat participants can view" ON public.chats
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = chats.companion_id AND user_id = auth.uid())
    );

CREATE POLICY "System can create chats" ON public.chats
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- RLS POLICIES - MESSAGES
-- =====================================================
CREATE POLICY "Chat participants can view messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND (
                auth.uid() = chats.user_id 
                OR EXISTS (SELECT 1 FROM public.profiles WHERE id = chats.companion_id AND user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Chat participants can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.is_active = true
            AND now() BETWEEN chats.starts_at AND chats.grace_period_ends_at
            AND (
                auth.uid() = chats.user_id 
                OR EXISTS (SELECT 1 FROM public.profiles WHERE id = chats.companion_id AND user_id = auth.uid())
            )
        )
    );

-- =====================================================
-- RLS POLICIES - COMPLAINTS
-- =====================================================
CREATE POLICY "Users can view own complaints" ON public.complaints
    FOR SELECT USING (
        auth.uid() = reporter_id 
        OR auth.uid() = reported_user_id
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'moderator')
    );

CREATE POLICY "Users can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update complaints" ON public.complaints
    FOR UPDATE USING (
        public.has_role(auth.uid(), 'admin') 
        OR public.has_role(auth.uid(), 'moderator')
    );

-- =====================================================
-- RLS POLICIES - BLOCKS
-- =====================================================
CREATE POLICY "Users can view own blocks" ON public.blocks
    FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks" ON public.blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks" ON public.blocks
    FOR DELETE USING (auth.uid() = blocker_id);

-- =====================================================
-- RLS POLICIES - FAVORITES
-- =====================================================
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - NOTIFICATIONS
-- =====================================================
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - ADMIN AUDIT LOGS
-- =====================================================
CREATE POLICY "Only admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can create audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('verifications', 'verifications', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-qr', 'payment-qr', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false);

-- Storage Policies - Avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policies - Gallery
CREATE POLICY "Gallery images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Users can upload own gallery images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own gallery images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own gallery images" ON storage.objects
    FOR DELETE USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policies - Verifications
CREATE POLICY "Users can view own verification docs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'verifications' AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR public.has_role(auth.uid(), 'admin')
        )
    );

CREATE POLICY "Users can upload verification docs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policies - Payment QR
CREATE POLICY "Payment QR is publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'payment-qr');

CREATE POLICY "Users can upload payment QR" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'payment-qr' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policies - Evidence
CREATE POLICY "Evidence viewable by reporter and admin" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'evidence' AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR public.has_role(auth.uid(), 'admin')
        )
    );

CREATE POLICY "Users can upload evidence" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_profiles_is_companion ON public.profiles(is_companion);
CREATE INDEX idx_companion_profiles_profile_id ON public.companion_profiles(profile_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_companion_id ON public.bookings(companion_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_verifications_status ON public.verifications(status);