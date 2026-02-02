-- Fix function search_path warnings
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Make chat and notification INSERT policies more restrictive
DROP POLICY IF EXISTS "System can create chats" ON public.chats;
CREATE POLICY "Authenticated users can create chats" ON public.chats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);