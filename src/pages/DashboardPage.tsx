import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function DashboardPage() {
    const { user, profile, isAdmin } = useAuth();

    // Redirect based on user role
    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    if (profile?.is_companion) {
        return <Navigate to="/companion" replace />;
    }

    // Regular users go to discover page
    return <Navigate to="/discover" replace />;
}
