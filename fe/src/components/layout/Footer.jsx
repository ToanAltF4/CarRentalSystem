import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="font-bold">E</span>
                            </div>
                            <span className="text-lg font-bold text-secondary">E-Rental</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Experience the future of transportation with our premium electric vehicle fleet.
                            Zero emissions, maximum performance.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-primary hover:text-white transition-colors"><Facebook size={18} /></a>
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-primary hover:text-white transition-colors"><Instagram size={18} /></a>
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-primary hover:text-white transition-colors"><Twitter size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-secondary mb-6">Company</h4>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-gray-500 hover:text-primary text-sm">About Us</Link></li>
                            <li><Link to="/careers" className="text-gray-500 hover:text-primary text-sm">Careers</Link></li>
                            <li><Link to="/blog" className="text-gray-500 hover:text-primary text-sm">Blog</Link></li>
                            <li><Link to="/press" className="text-gray-500 hover:text-primary text-sm">Press</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-secondary mb-6">Support</h4>
                        <ul className="space-y-3">
                            <li><Link to="/help" className="text-gray-500 hover:text-primary text-sm">Help Center</Link></li>
                            <li><Link to="/terms" className="text-gray-500 hover:text-primary text-sm">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="text-gray-500 hover:text-primary text-sm">Privacy Policy</Link></li>
                            <li><Link to="/contact" className="text-gray-500 hover:text-primary text-sm">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-secondary mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-500">
                                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                <span>123 EV Street, Tech City, TC 90210</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500">
                                <Phone size={18} className="text-primary shrink-0" />
                                <span>+84 90 123 4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500">
                                <Mail size={18} className="text-primary shrink-0" />
                                <span>support@erental.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">© 2026 E-Rental System. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="text-sm text-gray-400">English</span>
                        <span className="text-sm text-gray-400">USD</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
