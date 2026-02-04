import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function DashboardPage() {
    const { isAdmin, profile } = useAuth();

    // Redirect based on user role
    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    if (profile?.is_companion) {
        return <Navigate to="/companion-dashboard" replace />;
    }

    // Regular users go to user dashboard
    return <Navigate to="/user-dashboard" replace />;
}
