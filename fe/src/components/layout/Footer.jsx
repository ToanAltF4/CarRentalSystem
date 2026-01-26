import { Link } from 'react-router-dom';
import { Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react';

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
                                <span className="text-white font-bold text-xl">M</span>
                            </div>
                            <span className="text-2xl font-bold">Mioto</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                            Mioto là nền tảng chia sẻ xe ô tô, kết nối người dùng với hàng nghìn chủ xe uy tín,
                            giúp bạn dễ dàng thuê xe tự lái cho mọi hành trình.
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
                        <h4 className="font-bold text-lg mb-4">Chính sách</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/policy" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Chính sách và quy định
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link to="/dispute" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Giải quyết tranh chấp
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Customers */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Tìm hiểu thêm</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/guide" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Hướng dẫn chung
                                </Link>
                            </li>
                            <li>
                                <Link to="/booking-guide" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Hướng dẫn đặt xe
                                </Link>
                            </li>
                            <li>
                                <Link to="/payment-guide" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Hướng dẫn thanh toán
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-[#5fcf86] transition-colors text-sm">
                                    Câu hỏi thường gặp
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Liên hệ</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Phone size={16} className="text-[#5fcf86]" />
                                1900 9217
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Mail size={16} className="text-[#5fcf86]" />
                                support@mioto.vn
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                <MapPin size={16} className="text-[#5fcf86] mt-0.5" />
                                <span>Tầng 5, Toà nhà A, Quận 1, TP.HCM</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                        <p>© 2024 Mioto Vietnam. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <Link to="/terms" className="hover:text-[#5fcf86] transition-colors">
                                Điều khoản sử dụng
                            </Link>
                            <Link to="/privacy" className="hover:text-[#5fcf86] transition-colors">
                                Chính sách bảo mật
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
