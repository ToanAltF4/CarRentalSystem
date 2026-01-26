import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, TrendingUp, MapPin } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import PromoSection from '../components/PromoSection';
import CarCard from '../components/ui/CarCard';
import vehicleService from '../services/vehicleService';

// Mock data for featured cars (fallback)
const mockCars = [
    {
        id: 1,
        name: 'VinFast VF8 2023',
        imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800',
        dailyRate: 1500,
        rating: 5.0,
        trips: 45,
        location: 'Quận 7, TP.HCM',
        discount: 15,
        delivery: true,
        isElectric: true
    },
    {
        id: 2,
        name: 'Tesla Model 3 2024',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
        dailyRate: 2000,
        rating: 4.9,
        trips: 120,
        location: 'Quận 1, TP.HCM',
        discount: null,
        delivery: true,
        isElectric: true
    },
    {
        id: 3,
        name: 'Mercedes EQS 2024',
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
        dailyRate: 3500,
        rating: 5.0,
        trips: 28,
        location: 'Quận 2, TP.HCM',
        discount: 10,
        delivery: true,
        isElectric: true
    },
    {
        id: 4,
        name: 'VinFast VF9 2024',
        imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800',
        dailyRate: 2500,
        rating: 4.8,
        trips: 67,
        location: 'Quận 3, TP.HCM',
        discount: null,
        delivery: true,
        isElectric: true
    },
    {
        id: 5,
        name: 'BMW iX 2024',
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
        dailyRate: 2800,
        rating: 4.9,
        trips: 35,
        location: 'Quận Bình Thạnh',
        discount: 20,
        delivery: false,
        isElectric: true
    },
    {
        id: 6,
        name: 'Porsche Taycan 2024',
        imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f511a?auto=format&fit=crop&q=80&w=800',
        dailyRate: 4000,
        rating: 5.0,
        trips: 15,
        location: 'Quận 7, TP.HCM',
        discount: null,
        delivery: true,
        isElectric: true
    },
    {
        id: 7,
        name: 'Hyundai Ioniq 5 2024',
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800',
        dailyRate: 1800,
        rating: 4.7,
        trips: 89,
        location: 'Thủ Đức, TP.HCM',
        discount: null,
        delivery: true,
        isElectric: true
    },
    {
        id: 8,
        name: 'Kia EV6 2024',
        imageUrl: 'https://images.unsplash.com/photo-1606611013016-969c19ba27aa?auto=format&fit=crop&q=80&w=800',
        dailyRate: 1700,
        rating: 4.8,
        trips: 52,
        location: 'Gò Vấp, TP.HCM',
        discount: 5,
        delivery: true,
        isElectric: true
    }
];

// Location data
const locations = [
    { name: 'TP. Hồ Chí Minh', count: '2,500+ xe', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=400' },
    { name: 'Hà Nội', count: '1,800+ xe', image: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&q=80&w=400' },
    { name: 'Đà Nẵng', count: '800+ xe', image: 'https://images.unsplash.com/photo-1559592413-7d6ffba9e360?auto=format&fit=crop&q=80&w=400' },
    { name: 'Nha Trang', count: '500+ xe', image: 'https://images.unsplash.com/photo-1559628233-100c798642d4?auto=format&fit=crop&q=80&w=400' }
];

const HomePage = () => {
    const [featuredCars, setFeaturedCars] = useState(mockCars);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const data = await vehicleService.getAll();
                if (data && data.length > 0) {
                    // Map API data to match our card format
                    const mappedCars = data.slice(0, 8).map(car => ({
                        ...car,
                        trips: Math.floor(Math.random() * 100) + 10,
                        location: 'TP.HCM',
                        discount: Math.random() > 0.6 ? Math.floor(Math.random() * 20) + 5 : null,
                        delivery: Math.random() > 0.3,
                        isElectric: true
                    }));
                    setFeaturedCars(mappedCars);
                }
            } catch (error) {
                console.error('Failed to fetch vehicles:', error);
                // Keep mock data on error
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    return (
        <div className="bg-white">
            {/* Hero Section with Search */}
            <HeroSection />

            {/* Featured Cars Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-[#5fcf86] mb-2">
                                <Zap size={20} />
                                <span className="font-semibold text-sm uppercase tracking-wide">Xe điện</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#141414]">
                                Xe nổi bật
                            </h2>
                        </div>
                        <Link
                            to="/vehicles"
                            className="hidden md:flex items-center gap-2 text-[#5fcf86] font-semibold hover:underline"
                        >
                            Xem tất cả
                            <ChevronRight size={18} />
                        </Link>
                    </div>

                    {/* Cars Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredCars.map((car) => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    )}

                    {/* Mobile View All */}
                    <Link
                        to="/vehicles"
                        className="md:hidden mt-8 flex items-center justify-center gap-2 text-[#5fcf86] font-semibold"
                    >
                        Xem tất cả xe
                        <ChevronRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Locations Section */}
            <section className="py-16 bg-[#f6f6f6]">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-[#5fcf86] mb-2">
                                <MapPin size={20} />
                                <span className="font-semibold text-sm uppercase tracking-wide">Địa điểm</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#141414]">
                                Địa điểm nổi bật
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {locations.map((loc, index) => (
                            <Link
                                key={index}
                                to={`/vehicles?location=${loc.name}`}
                                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                            >
                                <img
                                    src={loc.image}
                                    alt={loc.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="font-bold text-lg">{loc.name}</h3>
                                    <p className="text-white/80 text-sm">{loc.count}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-[#5fcf86]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">8000+</div>
                            <div className="text-white/80">Xe cho thuê</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                            <div className="text-white/80">Tỉnh thành</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">100K+</div>
                            <div className="text-white/80">Chuyến thành công</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">4.9⭐</div>
                            <div className="text-white/80">Đánh giá</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features/Promo Section */}
            <PromoSection />

            {/* CTA Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-[#5fcf86] to-[#4bc076] rounded-3xl p-8 md:p-12 text-white text-center md:text-left md:flex md:items-center md:justify-between">
                        <div className="mb-6 md:mb-0">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                Bạn có xe nhàn rỗi?
                            </h2>
                            <p className="text-white/90">
                                Đăng ký ngay để gia nhập cộng đồng hơn 5,000 chủ xe kiếm thêm thu nhập
                            </p>
                        </div>
                        <Link
                            to="/become-host"
                            className="inline-block bg-white text-[#5fcf86] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Trở thành chủ xe
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
