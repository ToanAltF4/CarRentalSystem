import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import CarCard from '../components/ui/CarCard';
import vehicleService from '../services/vehicleService';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
    const [location, setLocation] = useState('HCMC');
    const [featuredCars, setFeaturedCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await vehicleService.getAll();
                // Map to frontend format
                const mappedCars = data.map(vehicleService.mapToCarCard);
                setFeaturedCars(mappedCars);
            } catch (err) {
                console.error("Failed to fetch vehicles:", err);
                setError("Could not load vehicles. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    return (
        <div className="flex flex-col gap-12 pb-12">
            {/* Hero Section */}
            <section className="relative h-[500px] md:h-[600px] w-full bg-secondary">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2072&auto=format&fit=crop"
                        alt="Hero EV"
                        className="h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent"></div>
                </div>

                {/* Hero Content */}
                <div className="container relative mx-auto flex h-full flex-col justify-center px-4 md:px-6">
                    <div className="max-w-2xl text-white">
                        <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-6xl">
                            Drive the Future. <br />
                            <span className="text-primary">Zero Emissions.</span>
                        </h1>
                        <p className="mb-8 text-lg font-medium text-gray-200 md:text-xl">
                            Rent premium electric vehicles for your next journey. Self-driving options available.
                        </p>
                    </div>

                    {/* Search Widget - Floating */}
                    <div className="absolute -bottom-16 left-4 right-4 z-20 mx-auto max-w-4xl rounded-2xl bg-white p-4 shadow-xl md:left-6 md:right-6 md:p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
                            {/* Location */}
                            <div className="relative md:col-span-1">
                                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Location</label>
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 transition-colors focus-within:border-primary focus-within:bg-white">
                                    <MapPin size={18} className="text-primary" />
                                    <select
                                        className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    >
                                        <option value="HCMC">Ho Chi Minh City</option>
                                        <option value="HN">Ha Noi</option>
                                        <option value="DN">Da Nang</option>
                                    </select>
                                </div>
                            </div>

                            {/* Start Date */}
                            <div className="relative md:col-span-1">
                                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Pick-up</label>
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 transition-colors focus-within:border-primary focus-within:bg-white">
                                    <Calendar size={18} className="text-gray-400" />
                                    <input type="datetime-local" className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none" />
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="relative md:col-span-1">
                                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Drop-off</label>
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 transition-colors focus-within:border-primary focus-within:bg-white">
                                    <Calendar size={18} className="text-gray-400" />
                                    <input type="datetime-local" className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none" />
                                </div>
                            </div>

                            {/* Button */}
                            <div className="flex items-end md:col-span-1">
                                <button className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-hover hover:shadow-primary/30">
                                    <Search size={20} />
                                    Find Car
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spacer for Search Widget */}
            <div className="h-10 md:h-12"></div>

            {/* Featured Section */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-secondary">Featured Vehicles</h2>
                        <p className="mt-2 text-gray-500">Top rated electric cars for your best experience</p>
                    </div>
                    <a href="/vehicles" className="group flex items-center gap-1 font-semibold text-primary hover:text-primary-hover">
                        View all <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {featuredCars.length > 0 ? (
                            featuredCars.map(car => (
                                <CarCard key={car.id} car={car} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No vehicles found. Check back soon!
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Promo Banner */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 text-center md:px-12 md:text-left">
                    <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="max-w-xl">
                            <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
                                Limited Offer
                            </span>
                            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                                First time renting an EV?
                            </h2>
                            <p className="mb-0 text-lg text-gray-300">
                                Get <span className="font-bold text-white">15% OFF</span> your first booking using code <span className="rounded bg-white/10 px-2 py-0.5 font-mono font-bold text-primary">EVFIRST</span>
                            </p>
                        </div>
                        <button className="flex items-center gap-2 rounded-full bg-white px-8 py-3 text-lg font-bold text-secondary shadow-lg transition-transform hover:scale-105 active:scale-95">
                            Claim Offer
                        </button>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -m-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -m-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
