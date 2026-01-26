import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, TrendingUp, MapPin } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import PromoSection from '../components/PromoSection';
import CarCard from '../components/ui/CarCard';
import vehicleService from '../services/vehicleService';

// Mock data removed

const locations = [
    { name: 'Ho Chi Minh City', count: '2,500+ vehicles', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=400' },
    { name: 'Hanoi', count: '1,800+ vehicles', image: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&q=80&w=400' },
    { name: 'Da Nang', count: '800+ vehicles', image: 'https://images.unsplash.com/photo-1559592413-7d6ffba9e360?auto=format&fit=crop&q=80&w=400' },
    { name: 'Nha Trang', count: '500+ vehicles', image: 'https://images.unsplash.com/photo-1559628233-100c798642d4?auto=format&fit=crop&q=80&w=400' }
];

const HomePage = () => {
    const [featuredCars, setFeaturedCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const data = await vehicleService.getAll();
                if (data && data.length > 0) {
                    // Map API data to match our card format
                    const mappedCars = data.slice(0, 8).map(car => ({
                        ...car,
                        trips: 0,
                        location: 'Ho Chi Minh City',
                        discount: null,
                        delivery: false,
                        isElectric: true
                    }));
                    setFeaturedCars(mappedCars);
                }
            } catch (error) {
                console.error('Failed to fetch vehicles:', error);
                setFeaturedCars([]);
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
                                <span className="font-semibold text-sm uppercase tracking-wide">Electric Vehicles</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#141414]">
                                Featured Vehicles
                            </h2>
                        </div>
                        <Link
                            to="/vehicles"
                            className="hidden md:flex items-center gap-2 text-[#5fcf86] font-semibold hover:underline"
                        >
                            View All
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
                        View All Vehicles
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
                                <span className="font-semibold text-sm uppercase tracking-wide">Locations</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#141414]">
                                Popular Locations
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
                            <div className="text-white/80">Vehicles</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                            <div className="text-white/80">Locations</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">100K+</div>
                            <div className="text-white/80">Successful Trips</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">4.9⭐</div>
                            <div className="text-white/80">Rating</div>
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
                                Partner with E-Fleet?
                            </h2>
                            <p className="text-white/90">
                                Join our network of premium vehicle suppliers and expand your business.
                            </p>
                        </div>
                        <Link
                            to="/corporate"
                            className="inline-block bg-white text-[#5fcf86] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Contact for Partnership
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
