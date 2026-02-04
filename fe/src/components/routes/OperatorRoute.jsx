import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const OperatorRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Allow OPERATOR, MANAGER, ADMIN (with or without ROLE_ prefix)
    const allowedRoles = [
        'ROLE_OPERATOR', 'ROLE_MANAGER', 'ROLE_ADMIN',
        'OPERATOR', 'MANAGER', 'ADMIN'
    ];
    const hasPermission = user && allowedRoles.includes(user.role);

    if (!user || !hasPermission) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};

export default OperatorRoute;
