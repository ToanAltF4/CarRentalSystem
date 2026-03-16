import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import PromoSection from '../components/PromoSection';
import CarCard from '../components/ui/CarCard';
import vehicleCategoryService from '../services/vehicleCategoryService';

// Mock data removed

const normalizeFeaturedCars = (categories) => {
    if (!Array.isArray(categories)) return [];

    const uniqueTypeKeys = new Set();

    return categories
        .map(vehicleCategoryService.normalizeCategory)
        .filter(Boolean)
        .filter((cat) => (cat.availableCount || 0) > 0)
        .filter((cat) => {
            const key = `${(cat.brand || '').trim().toLowerCase()}|${(cat.name || '').trim().toLowerCase()}|${(cat.model || '').trim().toLowerCase()}`;
            if (uniqueTypeKeys.has(key)) return false;
            uniqueTypeKeys.add(key);
            return true;
        })
        .slice(0, 8)
        .map((cat) => ({
            id: cat.id,
            name: `${cat.brand || ''} ${cat.name || ''}`.trim(),
            brand: cat.brand || '',
            model: cat.model || '',
            imageUrl: cat.primaryImageUrl || (Array.isArray(cat.imageUrls) ? cat.imageUrls[0] : ''),
            dailyRate: cat.dailyPrice || 0,
            trips: 0,
            location: 'Ho Chi Minh City',
            discount: null,
            delivery: false,
            isElectric: true
        }));
};

const HomePage = () => {
    const [featuredCars, setFeaturedCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const categories = await vehicleCategoryService.getAll();
                setFeaturedCars(normalizeFeaturedCars(categories));
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
