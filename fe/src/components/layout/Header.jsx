import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER' ||
        user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
            <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#5fcf86] rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <span className="text-2xl font-bold text-[#141414]">Mioto</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link
                        to="/about"
                        className="text-[#141414] hover:text-[#5fcf86] font-medium transition-colors"
                    >
                        Về Mioto
                    </Link>
                    <Link
                        to="/become-host"
                        className="border-2 border-[#5fcf86] text-[#5fcf86] px-5 py-2 rounded-lg font-semibold hover:bg-[#5fcf86] hover:text-white transition-all"
                    >
                        Trở thành chủ xe
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
                                        Chuyến của tôi
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-3 hover:bg-gray-50 text-[#141414]"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        Tài khoản của tôi
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            className="block px-4 py-3 hover:bg-gray-50 text-[#5fcf86] font-medium"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Quản trị viên
                                        </Link>
                                    )}
                                    <hr className="my-2 border-gray-100" />
                                    <button
                                        onClick={() => { logout(); setUserMenuOpen(false); }}
                                        className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 bg-white border-2 border-[#5fcf86] text-[#5fcf86] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#5fcf86] hover:text-white transition-all"
                        >
                            <User size={18} />
                            Đăng ký / Đăng nhập
                        </Link>
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
                    <Link to="/about" className="block py-2 text-[#141414] font-medium">Về Mioto</Link>
                    <Link to="/become-host" className="block py-2 text-[#5fcf86] font-medium">Trở thành chủ xe</Link>
                    <hr className="border-gray-100" />
                    {isAuthenticated ? (
                        <>
                            <Link to="/my-bookings" className="block py-2 text-[#141414]">Chuyến của tôi</Link>
                            <Link to="/profile" className="block py-2 text-[#141414]">Tài khoản</Link>
                            {isAdmin && <Link to="/admin" className="block py-2 text-[#5fcf86]">Quản trị viên</Link>}
                            <button onClick={logout} className="block py-2 text-red-500">Đăng xuất</button>
                        </>
                    ) : (
                        <Link to="/login" className="block py-2 text-[#5fcf86] font-semibold">Đăng ký / Đăng nhập</Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
