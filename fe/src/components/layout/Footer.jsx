import { Link } from 'react-router-dom';
import { Facebook, Youtube, Phone, Mail, MapPin, Zap } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#141414] text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-[#5fcf86] rounded-xl flex items-center justify-center">
                                <Zap className="text-white" size={22} />
                            </div>
                            <span className="text-2xl font-bold">E-Fleet</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                            E-Fleet is the leading electric vehicle rental platform, connecting you with
                            eco-friendly transportation for a sustainable future.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#5fcf86] transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#5fcf86] transition-colors">
                                <Youtube size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/vehicles" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Browse Vehicles
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/corporate" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Corporate Services
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Support</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link to="/booking-guide" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    How to Book
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Pricing & Policies
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Phone size={16} className="text-[#5fcf86]" />
                                1900 1234
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Mail size={16} className="text-[#5fcf86]" />
                                support@efleet.vn
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                <MapPin size={16} className="text-[#5fcf86] mt-0.5" />
                                <span>Ho Chi Minh City, Vietnam</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                        <p>© 2024 E-Fleet Vietnam. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <Link to="/terms" className="hover:text-[#5fcf86] transition-colors">
                                Terms of Use
                            </Link>
                            <Link to="/privacy" className="hover:text-[#5fcf86] transition-colors">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
