import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, Car, Users } from 'lucide-react';

const HeroSection = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('self-drive'); // 'self-drive' | 'with-driver'
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
                className="h-[500px] md:h-[600px] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1449965408869-euj2876e43c9?auto=format&fit=crop&q=80&w=1920')`
                }}
            >
                <div className="container mx-auto h-full flex flex-col items-center justify-center px-4">
                    {/* Hero Text */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4 drop-shadow-lg">
                        Mioto - Cùng Bạn Đến Mọi Hành Trình
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 text-center mb-8 max-w-2xl">
                        Trải nghiệm sự khác biệt từ hơn 8000 xe gia đình đời mới khắp Việt Nam
                    </p>
                </div>
            </div>

            {/* Floating Search Box */}
            <div className="container mx-auto px-4">
                <div className="relative -mt-28 md:-mt-24 bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto border border-gray-100">
                    {/* Tabs */}
                    <div className="flex mb-6 bg-gray-100 rounded-xl p-1 max-w-xs">
                        <button
                            onClick={() => setActiveTab('self-drive')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'self-drive'
                                    ? 'bg-white text-[#5fcf86] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Car size={18} />
                            Xe tự lái
                        </button>
                        <button
                            onClick={() => setActiveTab('with-driver')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'with-driver'
                                    ? 'bg-white text-[#5fcf86] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Users size={18} />
                            Xe có tài
                        </button>
                    </div>

                    {/* Search Form */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Location */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Địa điểm
                            </label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Chọn thành phố</option>
                                    <option value="hcm">TP. Hồ Chí Minh</option>
                                    <option value="hanoi">Hà Nội</option>
                                    <option value="danang">Đà Nẵng</option>
                                    <option value="nhatrang">Nha Trang</option>
                                    <option value="dalat">Đà Lạt</option>
                                </select>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Ngày nhận xe
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
                                Ngày trả xe
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
                                Tìm xe
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
