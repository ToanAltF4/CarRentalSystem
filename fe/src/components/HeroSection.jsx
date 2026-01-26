import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, Zap, ShieldCheck, Headphones, Sparkles } from 'lucide-react';

/**
 * B2C Enterprise Hero Section
 * - Premium EV Experience slogan
 * - Simple self-driving search (no tabs for driver service)
 * - Company quality guarantees
 */
const HeroSection = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (location) params.set('location', location);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        navigate(`/vehicles?${params.toString()}`);
    };

    return (
        <section className="relative">
            {/* Background Image */}
            <div
                className="h-[520px] md:h-[620px] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(20,20,20,0.7), rgba(20,20,20,0.5)), url('https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1920')`
                }}
            >
                <div className="container mx-auto h-full flex flex-col items-center justify-center px-4">
                    {/* Badge */}
                    <div className="flex items-center gap-2 bg-[#5fcf86]/20 border border-[#5fcf86]/40 text-[#5fcf86] px-4 py-2 rounded-full mb-6">
                        <Zap size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wider">100% Premium Electric Fleet</span>
                    </div>

                    {/* Hero Text */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4 drop-shadow-lg leading-tight">
                        Experience Premium Electric Driving
                    </h1>
                    <p className="text-xl md:text-2xl text-[#5fcf86] font-semibold text-center mb-2">
                        5-Star Service Quality
                    </p>
                    <p className="text-base md:text-lg text-white/80 text-center mb-8 max-w-2xl">
                        E-Fleet provides modern electric vehicles, regularly maintained and sanitized.
                        24/7 Support Team.
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-6 mb-8">
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                            <ShieldCheck size={18} className="text-[#5fcf86]" />
                            <span>Comprehensive Insurance</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                            <Sparkles size={18} className="text-[#5fcf86]" />
                            <span>New 2023-2024 Models</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                            <Headphones size={18} className="text-[#5fcf86]" />
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Search Box */}
            <div className="container mx-auto px-4">
                <div className="relative -mt-20 bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto border border-gray-100">
                    {/* Title */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-[#141414]">Self-Driving Car Rental</h2>
                        <p className="text-sm text-gray-500">Choose location and dates to find available vehicles</p>
                    </div>

                    {/* Search Form */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Location */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select City</option>
                                    <option value="hcm">Ho Chi Minh City</option>
                                    <option value="hanoi">Hanoi</option>
                                    <option value="danang">Da Nang</option>
                                    <option value="nhatrang">Nha Trang</option>
                                    <option value="dalat">Da Lat</option>
                                </select>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Pick-up Date
                            </label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={today}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Return Date
                            </label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || today}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="md:col-span-1 flex items-end">
                            <button
                                onClick={handleSearch}
                                className="w-full flex items-center justify-center gap-2 bg-[#5fcf86] hover:bg-[#4bc076] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#5fcf86]/30 hover:shadow-xl hover:shadow-[#5fcf86]/40 transition-all active:scale-[0.98]"
                            >
                                <Search size={20} />
                                Find Vehicle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
