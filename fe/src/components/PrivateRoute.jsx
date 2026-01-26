import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute - Protects routes that require authentication
 * @param {ReactNode} children - Component to render if authorized
 * @param {string[]} allowedRoles - Optional array of roles allowed to access this route
 */
function PrivateRoute({ children, allowedRoles = [] }) {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading while checking auth state
    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // Not authenticated - redirect to login with return URL
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role if allowedRoles is specified
    if (allowedRoles.length > 0 && user) {
        const hasRequiredRole = allowedRoles.includes(user.role);

        if (!hasRequiredRole) {
            // User doesn't have required role - redirect to home or forbidden page
            return (
                <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
                    <p className="text-gray-600 mb-4">Access Denied</p>
                    <p className="text-sm text-gray-500 mb-6">
                        You don't have permission to access this page.
                    </p>
                    <a
                        href="/"
                        className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-hover"
                    >
                        Go Home
                    </a>
                </div>
            );
        }
    }

    // Authenticated and authorized - render children
    return children;
}

export default PrivateRoute;
