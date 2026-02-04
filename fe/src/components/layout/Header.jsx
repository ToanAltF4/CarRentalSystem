import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, ChevronDown, Menu, X, CarFront } from 'lucide-react';
import { useState } from 'react';

/**
 * B2C Enterprise Header
 * - No "Become a Host" feature (Company owns all vehicles)
 * - Links: About Us, Corporate Services, Pricing
 */
const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    console.log('Current User:', user);
    console.log('User Role:', user?.role);
    console.log('Is Authenticated:', isAuthenticated);

    const isAdmin = ['ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER'].includes(user?.role);
    const isOperator = ['OPERATOR', 'ROLE_OPERATOR'].includes(user?.role);
    const isStaff = ['STAFF', 'ROLE_STAFF'].includes(user?.role);

    // Effective role check
    const showAdminLink = isAdmin;
    const showOperatorLink = isOperator || isAdmin;
    const showStaffLink = isStaff || isAdmin || isOperator; // Admins/Operators can access too

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
            <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-6">
                {/* Logo - E-Fleet */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#5fcf86] rounded-xl flex items-center justify-center">
                        <CarFront className="text-white" size={22} />
                    </div>
                    <span className="text-2xl font-bold text-[#141414]">E-Fleet</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link
                        to="/vehicles"
                        className="text-[#141414] hover:text-[#5fcf86] font-medium transition-colors"
                    >
                        Fleet
                    </Link>
                    <Link
                        to="/pricing"
                        className="text-[#141414] hover:text-[#5fcf86] font-medium transition-colors"
                    >
                        Pricing
                    </Link>
                    <Link
                        to="/corporate"
                        className="text-[#141414] hover:text-[#5fcf86] font-medium transition-colors"
                    >
                        Corporate Services
                    </Link>
                    <Link
                        to="/about"
                        className="text-[#141414] hover:text-[#5fcf86] font-medium transition-colors"
                    >
                        About Us
                    </Link>
                </nav>

                {/* User Section */}
                <div className="hidden lg:flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors"
                            >
                                <div className="w-8 h-8 bg-[#5fcf86] rounded-full flex items-center justify-center">
                                    <User size={18} className="text-white" />
                                </div>
                                <span className="font-medium text-[#141414]">{user.fullName || 'User'}</span>
                                <ChevronDown size={16} className="text-gray-500" />
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                    <Link
                                        to="/my-bookings"
                                        className="block px-4 py-3 hover:bg-gray-50 text-[#141414]"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        My Bookings
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-3 hover:bg-gray-50 text-[#141414]"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    {showAdminLink && (
                                        <Link
                                            to="/admin"
                                            className="block px-4 py-3 hover:bg-gray-50 text-[#5fcf86] font-medium"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    {showOperatorLink && (
                                        <Link
                                            to="/operator"
                                            className="block px-4 py-3 hover:bg-gray-50 text-blue-600 font-medium"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Operator Portal
                                        </Link>
                                    )}
                                    {showStaffLink && (
                                        <Link
                                            to="/staff"
                                            className="block px-4 py-3 hover:bg-gray-50 text-orange-600 font-medium"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Staff Portal
                                        </Link>
                                    )}
                                    <hr className="my-2 border-gray-100" />
                                    <button
                                        onClick={() => { logout(); setUserMenuOpen(false); }}
                                        className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="flex items-center gap-2 bg-[#5fcf86] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#4bc076] transition-all shadow-md border-2 border-transparent"
                            >
                                <User size={18} />
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2.5 rounded-lg font-semibold text-[#5fcf86] border-2 border-[#5fcf86] hover:bg-[#5fcf86] hover:text-white transition-all duration-300"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4">
                    <Link to="/vehicles" className="block py-2 text-[#141414] font-medium">Fleet</Link>
                    <Link to="/pricing" className="block py-2 text-[#141414] font-medium">Pricing</Link>
                    <Link to="/corporate" className="block py-2 text-[#141414] font-medium">Corporate Services</Link>
                    <Link to="/about" className="block py-2 text-[#141414] font-medium">About Us</Link>
                    <hr className="border-gray-100" />
                    {isAuthenticated ? (
                        <>
                            <Link to="/my-bookings" className="block py-2 text-[#141414]">My Bookings</Link>
                            <Link to="/profile" className="block py-2 text-[#141414]">Profile</Link>
                            {showAdminLink && <Link to="/admin" className="block py-2 text-[#5fcf86]">Admin Dashboard</Link>}
                            {showOperatorLink && <Link to="/operator" className="block py-2 text-blue-600">Operator Portal</Link>}
                            {showStaffLink && <Link to="/staff" className="block py-2 text-orange-600">Staff Portal</Link>}
                            <button onClick={logout} className="block py-2 text-red-500">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="block py-2 text-[#5fcf86] font-semibold">Login</Link>
                            <Link to="/register" className="block py-2 text-[#141414] font-medium">Register</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
