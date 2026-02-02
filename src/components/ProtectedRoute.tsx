import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireCompanion?: boolean;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireCompanion = false,
  requireOnboarding = false,
}: ProtectedRouteProps) => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      navigate('/auth');
      return;
    }

    if (requireAdmin && !isAdmin) {
      navigate('/');
      return;
    }

    if (requireCompanion && profile && !profile.is_companion) {
      navigate('/onboarding');
      return;
    }

    // Check if user needs onboarding
    if (requireOnboarding && user && profile && !profile.consent_accepted) {
      navigate('/onboarding');
      return;
    }
  }, [user, profile, isAdmin, isLoading, requireAuth, requireAdmin, requireCompanion, requireOnboarding, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !user) return null;
  if (requireAdmin && !isAdmin) return null;
  if (requireCompanion && profile && !profile.is_companion) return null;

  return <>{children}</>;
};
