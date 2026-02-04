import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const StaffRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Allow STAFF, OPERATOR, MANAGER, ADMIN
    const allowedRoles = [
        'ROLE_STAFF', 'STAFF',
        'ROLE_OPERATOR', 'OPERATOR',
        'ROLE_MANAGER', 'MANAGER',
        'ROLE_ADMIN', 'ADMIN'
    ];

    // Check if user has any of the allowed roles
    const hasPermission = user && allowedRoles.includes(user.role);

    if (!user || !hasPermission) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};

export default StaffRoute;
