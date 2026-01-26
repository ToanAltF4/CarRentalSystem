import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

/**
 * PrivateRoute Component
 * Protects routes that require authentication and/or specific roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route (e.g., ['ADMIN', 'MANAGER'])
 */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5fcf86] border-t-transparent"></div>
            </div>
        );
    }

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0 && user) {
        // Normalize role (handle both "ADMIN" and "ROLE_ADMIN" formats)
        const userRole = user.role?.replace('ROLE_', '');
        const hasRequiredRole = allowedRoles.some(role =>
            role === userRole || role === `ROLE_${userRole}` || `ROLE_${role}` === user.role
        );

        if (!hasRequiredRole) {
            // Show 403 Forbidden page
            return <ForbiddenPage userRole={userRole} requiredRoles={allowedRoles} />;
        }
    }

    // User is authenticated and has required role
    return children;
};

/**
 * 403 Forbidden Page Component
 */
const ForbiddenPage = ({ userRole, requiredRoles }) => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                    <ShieldX size={48} className="text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>

                {/* Description */}
                <p className="text-gray-500 mb-6">
                    You don't have permission to access this page.
                    {userRole && (
                        <span className="block mt-2 text-sm">
                            Your role: <span className="font-semibold text-gray-700">{userRole}</span>
                        </span>
                    )}
                    {requiredRoles?.length > 0 && (
                        <span className="block mt-1 text-sm">
                            Required: <span className="font-semibold text-gray-700">{requiredRoles.join(' or ')}</span>
                        </span>
                    )}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5fcf86] text-white rounded-xl font-semibold hover:bg-[#4bc076] transition-colors"
                    >
                        <Home size={18} />
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PrivateRoute;
