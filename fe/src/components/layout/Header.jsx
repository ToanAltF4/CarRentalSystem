import { Link } from 'react-router-dom';
import { Car, Menu, User, Bell } from 'lucide-react';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                        <Car size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold leading-none text-secondary">E-Rental</span>
                        <span className="text-[10px] font-medium text-gray-500">EV FLEET SYSTEM</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link to="/vehicles" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                        Vehicles
                    </Link>
                    <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                        About Us
                    </Link>
                    <Link to="/blog" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                        Blog
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors">
                        <Bell size={20} />
                    </button>
                    <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-4">
                        <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-primary">
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-colors"
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <button className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
