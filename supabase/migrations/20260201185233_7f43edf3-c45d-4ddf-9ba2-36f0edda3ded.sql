-- Add separate flag for identity verification (real user verification)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_identity_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS identity_verified_at timestamp with time zone;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS identity_verified_by uuid;

-- Prevent users from self-verifying (identity or badge) and lock names after identity verification
CREATE OR REPLACE FUNCTION public.profiles_protect_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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

DROP TRIGGER IF EXISTS trg_profiles_protect_sensitive_fields ON public.profiles;
CREATE TRIGGER trg_profiles_protect_sensitive_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_protect_sensitive_fields();
