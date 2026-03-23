import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * ProtectedRoute component - Guards routes that require authentication
 * @param {ReactNode} children - Component to render if authenticated
 * @param {string[]} allowedRoles - Array of roles allowed to access this route
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated but role not allowed - redirect to home
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    // Authenticated and role allowed - render children
    return children;
}

export default ProtectedRoute;
