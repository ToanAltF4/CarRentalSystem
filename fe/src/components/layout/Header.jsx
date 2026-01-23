import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Header = () => {
    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    EV Fleet
                </Link>

                {/* Navigation */}
                <nav className="flex items-center space-x-6">
                    <Link to="/vehicles" className="hover:text-blue-600">
                        Vehicles
                    </Link>

                    {isAuthenticated && (
                        <Link to="/my-bookings" className="hover:text-blue-600">
                            My Bookings
                        </Link>
                    )}

                    {/* Admin Link - only for ADMIN/MANAGER */}
                    {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                        <Link to="/admin" className="hover:text-blue-600">
                            Admin Panel
                        </Link>
                    )}

                    {/* Auth Buttons */}
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">
                                Welcome, {user?.fullName || 'User'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="rounded-md border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
