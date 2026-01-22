import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Loader2, X } from 'lucide-react';
import CarCard from '../components/ui/CarCard';
import vehicleService from '../services/vehicleService';

const VehicleListPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('name');
    const [showFilters, setShowFilters] = useState(false);

    const brands = ['ALL', 'Tesla', 'VinFast', 'Hyundai', 'BMW', 'Porsche'];
    const categories = ['ALL', 'Sedan', 'SUV', 'Luxury'];

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

    // Filter and sort logic
    const filteredVehicles = vehicles
        .filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.brand.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBrand = selectedBrand === 'ALL' || v.brand === selectedBrand;
            const matchesCategory = selectedCategory === 'ALL' || v.category?.name === selectedCategory;
            return matchesSearch && matchesBrand && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.dailyRate - b.dailyRate;
                case 'price-high': return b.dailyRate - a.dailyRate;
                case 'range': return (b.rangeKm || 0) - (a.rangeKm || 0);
                default: return a.name.localeCompare(b.name);
            }
        })
        .map(vehicleService.mapToCarCard);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedBrand('ALL');
        setSelectedCategory('ALL');
        setSortBy('name');
    };

    const hasActiveFilters = searchTerm || selectedBrand !== 'ALL' || selectedCategory !== 'ALL';

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Hero Banner */}
            <div className="bg-secondary text-white py-12 mb-8">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Explore Our Fleet</h1>
                    <p className="text-gray-300 text-lg">Find the perfect electric vehicle for your journey</p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 -mt-16 relative z-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or brand..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        {/* Desktop Filters */}
                        <div className="hidden md:flex items-center gap-3">
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none bg-white min-w-[140px]"
                            >
                                {brands.map(brand => (
                                    <option key={brand} value={brand}>{brand === 'ALL' ? 'All Brands' : brand}</option>
                                ))}
                            </select>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none bg-white min-w-[140px]"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary outline-none bg-white min-w-[160px]"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="range">Longest Range</option>
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 px-4 py-3 text-sm text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <X size={16} />
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm"
                        >
                            <SlidersHorizontal size={18} />
                            Filters
                            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Mobile Filters Dropdown */}
                    {showFilters && (
                        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                            >
                                {brands.map(brand => (
                                    <option key={brand} value={brand}>{brand === 'ALL' ? 'All Brands' : brand}</option>
                                ))}
                            </select>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="col-span-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="range">Longest Range</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        <span className="font-bold text-secondary">{filteredVehicles.length}</span> vehicles found
                    </p>
                </div>

                {/* Vehicle Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">{error}</div>
                ) : filteredVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredVehicles.map(car => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleListPage;
