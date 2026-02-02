-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all profiles (including inactive)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete verifications for re-verification
CREATE POLICY "Admins can delete verifications"
ON public.verifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));