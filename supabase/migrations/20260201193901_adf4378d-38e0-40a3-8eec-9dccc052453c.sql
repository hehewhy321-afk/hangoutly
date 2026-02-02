-- Drop the existing insert policy
DROP POLICY IF EXISTS "Authenticated users can create chats" ON public.chats;

-- Create new policy that allows both user and companion to create chats
CREATE POLICY "Booking participants can create chats"
ON public.chats
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = chats.companion_id
    AND profiles.user_id = auth.uid()
  )
);

-- Also allow updates for chat status
CREATE POLICY "Chat participants can update chats"
ON public.chats
FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = chats.companion_id
    AND profiles.user_id = auth.uid()
  )
);