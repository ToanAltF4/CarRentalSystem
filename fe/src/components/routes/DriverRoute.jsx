import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const DriverRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Allow DRIVER, OPERATOR, MANAGER, ADMIN
    const allowedRoles = [
        'ROLE_DRIVER', 'DRIVER',
        'ROLE_OPERATOR', 'OPERATOR',
        'ROLE_MANAGER', 'MANAGER',
        'ROLE_ADMIN', 'ADMIN'
    ];

    const hasPermission = user && allowedRoles.includes(user.role);

    if (!user || !hasPermission) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};

export default DriverRoute;
