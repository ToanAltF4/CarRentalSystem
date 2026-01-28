import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, Loader2, X, MapPin, ChevronRight, Car } from 'lucide-react';
import CarCard from '../components/ui/CarCard';
import vehicleService from '../services/vehicleService';

const VehicleListPage = () => {
    const [searchParams] = useSearchParams();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [priceRange, setPriceRange] = useState('ALL');
    const [sortBy, setSortBy] = useState('popular');
    const [showFilters, setShowFilters] = useState(false);

    const brands = ['ALL', 'Tesla', 'VinFast', 'Hyundai', 'BMW', 'BYD', 'Mercedes-Benz', 'Kia'];
    const categories = ['ALL', 'Sedan', 'SUV', 'Compact', 'Luxury', 'Crossover'];
    const priceRanges = [
        { value: 'ALL', label: 'All Prices' },
        { value: '0-1000', label: 'Under 1,000K' },
        { value: '1000-2000', label: '1,000K - 2,000K' },
        { value: '2000-3000', label: '2,000K - 3,000K' },
        { value: '3000+', label: 'Over 3,000K' }
    ];

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const data = await vehicleService.getAll();
            // Only show AVAILABLE vehicles for public page
            const availableVehicles = data.filter(v => v.status === 'AVAILABLE');
            setVehicles(availableVehicles);
        } catch (err) {
            console.error("Error fetching vehicles:", err);
            setError("Failed to load vehicles.");
        } finally {
            setLoading(false);
        }
    };

    // Filter by price range (prices in VND, labels in K = thousands)
    const filterByPrice = (vehicle) => {
        if (priceRange === 'ALL') return true;
        const price = vehicle.dailyRate;
        switch (priceRange) {
            case '0-1000': return price < 1000000;
            case '1000-2000': return price >= 1000000 && price < 2000000;
            case '2000-3000': return price >= 2000000 && price < 3000000;
            case '3000+': return price >= 3000000;
            default: return true;
        }
    };

    // Filter and sort logic
    const filteredVehicles = vehicles
        .filter(v => {
            const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.brand?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBrand = selectedBrand === 'ALL' || v.brand === selectedBrand;
            const matchesCategory = selectedCategory === 'ALL' || v.categoryName === selectedCategory;
            const matchesPrice = filterByPrice(v);
            return matchesSearch && matchesBrand && matchesCategory && matchesPrice;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.dailyRate - b.dailyRate;
                case 'price-high': return b.dailyRate - a.dailyRate;
                case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
                case 'popular': return (b.trips || 0) - (a.trips || 0);
                default: return a.name?.localeCompare(b.name || '');
            }
        })
        .map(v => ({
            ...v,
            trips: 0,
            location: 'Ho Chi Minh City',
            discount: null,
            delivery: false,
            isElectric: true
        }));

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedBrand('ALL');
        setSelectedCategory('ALL');
        setPriceRange('ALL');
        setSortBy('popular');
    };

    const hasActiveFilters = searchTerm || selectedBrand !== 'ALL' || selectedCategory !== 'ALL' || priceRange !== 'ALL';

    return (
        <div className="min-h-screen bg-[#f6f6f6]">
            {/* Breadcrumb & Title */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Link to="/" className="hover:text-[#5fcf86]">Home</Link>
                        <ChevronRight size={14} />
                        <span className="font-medium text-[#141414]">All Vehicles</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#141414]">
                        Premium EV Fleet
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {filteredVehicles.length} vehicles available
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-[#141414] text-lg">Filters</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-[#5fcf86] hover:underline"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Vehicle name, brand..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Brand Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Brand
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {brands.map(brand => (
                                        <button
                                            key={brand}
                                            onClick={() => setSelectedBrand(brand)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedBrand === brand
                                                ? 'bg-[#5fcf86] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {brand === 'ALL' ? 'All' : brand}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Category
                                </label>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="w-4 h-4 text-[#5fcf86] border-gray-300 focus:ring-[#5fcf86]"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {cat === 'ALL' ? 'All' : cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Price Range
                                </label>
                                <div className="space-y-2">
                                    {priceRanges.map(range => (
                                        <label key={range.value} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                checked={priceRange === range.value}
                                                onChange={() => setPriceRange(range.value)}
                                                className="w-4 h-4 text-[#5fcf86] border-gray-300 focus:ring-[#5fcf86]"
                                            />
                                            <span className="text-sm text-gray-700">{range.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Mobile Filter Bar */}
                        <div className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#5fcf86] outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium ${hasActiveFilters
                                        ? 'border-[#5fcf86] text-[#5fcf86] bg-[#5fcf86]/5'
                                        : 'border-gray-200 text-gray-600'
                                        }`}
                                >
                                    <SlidersHorizontal size={18} />
                                    Filter
                                </button>
                            </div>

                            {/* Mobile Filters Dropdown */}
                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                                    <select
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                                    >
                                        {brands.map(brand => (
                                            <option key={brand} value={brand}>
                                                {brand === 'ALL' ? 'All Brands' : brand}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                                    >
                                        {priceRanges.map(range => (
                                            <option key={range.value} value={range.value}>{range.label}</option>
                                        ))}
                                    </select>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="w-full py-2.5 text-sm text-[#5fcf86] font-medium"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sort Bar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
                            <p className="text-gray-600 text-sm">
                                <span className="font-bold text-[#141414]">{filteredVehicles.length}</span> vehicles found
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#5fcf86] outline-none bg-white"
                                >
                                    <option value="popular">Most Popular</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </div>
                        </div>

                        {/* Vehicle Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-[#5fcf86] mb-4" />
                                <p className="text-gray-500">Loading vehicles...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">😔</div>
                                <p className="text-red-500 mb-4">{error}</p>
                                <button
                                    onClick={fetchVehicles}
                                    className="px-6 py-2 bg-[#5fcf86] text-white rounded-lg font-semibold hover:bg-[#4bc076] transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredVehicles.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredVehicles.map(car => (
                                    <CarCard key={car.id} car={car} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <Car className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-[#141414] mb-2">No vehicles found</h3>
                                <p className="text-gray-500 mb-6">Try changing your filters or search terms</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 bg-[#5fcf86] text-white rounded-xl font-semibold hover:bg-[#4bc076] transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default VehicleListPage;
