import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, ChevronRight, Car } from 'lucide-react';
import CarCard from '../components/ui/CarCard';
import vehicleCategoryService from '../services/vehicleCategoryService';
import vehicleService from '../services/vehicleService';

const PRICE_RANGES = [
    { value: 'ALL', label: 'All Prices' },
    { value: '0-1000', label: 'Under 1,000K' },
    { value: '1000-2000', label: '1,000K - 2,000K' },
    { value: '2000-3000', label: '2,000K - 3,000K' },
    { value: '3000+', label: 'Over 3,000K' }
];

const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const VehicleListPage = () => {
    const [categoryCatalog, setCategoryCatalog] = useState([]);
    const [brandCatalog, setBrandCatalog] = useState([]);
    const [vehiclePool, setVehiclePool] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');
    const [priceRange, setPriceRange] = useState('ALL');
    const [sortBy, setSortBy] = useState('popular');
    const [showFilters, setShowFilters] = useState(false);

    const didMountSearchRef = useRef(false);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [categoryRaw, brandRaw, vehicles] = await Promise.all([
                vehicleCategoryService.getAll(),
                vehicleCategoryService.getBrands().catch(() => []),
                vehicleService.getAll()
            ]);

            const normalizedCategories = (Array.isArray(categoryRaw) ? categoryRaw : [])
                .map((item) => vehicleCategoryService.normalizeCategory(item))
                .filter(Boolean);

            setCategoryCatalog(normalizedCategories);
            setBrandCatalog(Array.isArray(brandRaw) ? brandRaw.filter(Boolean) : []);
            setVehiclePool(Array.isArray(vehicles) ? vehicles : []);
            setIsReady(true);
        } catch (err) {
            console.error('Error loading vehicles page:', err);
            setError('Failed to load vehicles.');
            setCategoryCatalog([]);
            setBrandCatalog([]);
            setVehiclePool([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        if (!isReady) return;
        if (!didMountSearchRef.current) {
            didMountSearchRef.current = true;
            return;
        }

        const timer = setTimeout(async () => {
            const keyword = searchTerm.trim();
            setSearching(true);
            try {
                const data = keyword
                    ? await vehicleService.search(keyword)
                    : await vehicleService.getAll();
                setVehiclePool(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err) {
                console.error('Error filtering vehicles from API:', err);
                setError('Failed to filter vehicles from server.');
                setVehiclePool([]);
            } finally {
                setSearching(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [isReady, searchTerm]);

    const statsByCategory = useMemo(() => {
        const map = new Map();
        vehiclePool.forEach((vehicle) => {
            if (!vehicle?.categoryId) return;
            const current = map.get(vehicle.categoryId) || {
                total: 0,
                available: 0,
                plateIndex: []
            };
            current.total += 1;
            if (vehicle.status === 'AVAILABLE') {
                current.available += 1;
            }
            if (vehicle.licensePlate) {
                current.plateIndex.push(vehicle.licensePlate.toLowerCase());
            }
            map.set(vehicle.categoryId, current);
        });
        return map;
    }, [vehiclePool]);

    const categoriesFromApi = useMemo(() => {
        return categoryCatalog
            .map((category) => {
                const stats = statsByCategory.get(category.id) || {
                    total: 0,
                    available: 0,
                    plateIndex: []
                };
                return {
                    ...category,
                    vehicleCount: stats.total,
                    availableCount: stats.available,
                    plateIndex: stats.plateIndex.join(' ')
                };
            })
            .filter((category) => category.vehicleCount > 0);
    }, [categoryCatalog, statsByCategory]);

    const brands = useMemo(() => {
        const fromData = [...new Set(categoriesFromApi.map((item) => item.brand).filter(Boolean))].sort();
        if (!brandCatalog.length) {
            return ['ALL', ...fromData];
        }
        const apiBrandList = brandCatalog.filter((brand) => fromData.includes(brand));
        return ['ALL', ...(apiBrandList.length ? apiBrandList : fromData)];
    }, [brandCatalog, categoriesFromApi]);

    const types = useMemo(() => {
        const scoped = categoriesFromApi.filter((item) => selectedBrand === 'ALL' || item.brand === selectedBrand);
        const uniqueTypes = [...new Set(scoped.map((item) => item.name).filter(Boolean))].sort();
        return ['ALL', ...uniqueTypes];
    }, [categoriesFromApi, selectedBrand]);

    const typeCountMap = useMemo(() => {
        const map = new Map();
        categoriesFromApi.forEach((item) => {
            if (selectedBrand !== 'ALL' && item.brand !== selectedBrand) return;
            map.set(item.name, (map.get(item.name) || 0) + (item.vehicleCount || 0));
        });
        return map;
    }, [categoriesFromApi, selectedBrand]);

    useEffect(() => {
        if (!brands.includes(selectedBrand)) {
            setSelectedBrand('ALL');
        }
    }, [brands, selectedBrand]);

    useEffect(() => {
        if (!types.includes(selectedType)) {
            setSelectedType('ALL');
        }
    }, [types, selectedType]);

    const filterByPrice = (vehicleType) => {
        if (priceRange === 'ALL') return true;
        const price = toNumber(vehicleType.dailyPrice);
        switch (priceRange) {
            case '0-1000':
                return price < 1000000;
            case '1000-2000':
                return price >= 1000000 && price < 2000000;
            case '2000-3000':
                return price >= 2000000 && price < 3000000;
            case '3000+':
                return price >= 3000000;
            default:
                return true;
        }
    };

    const keyword = searchTerm.trim().toLowerCase();
    const filteredVehicleTypes = categoriesFromApi
        .filter((item) => {
            const matchesKeyword =
                !keyword ||
                `${item.brand} ${item.name} ${item.model} ${item.plateIndex}`.toLowerCase().includes(keyword);
            const matchesBrand = selectedBrand === 'ALL' || item.brand === selectedBrand;
            const matchesType = selectedType === 'ALL' || item.name === selectedType;
            const matchesPrice = filterByPrice(item);
            return matchesKeyword && matchesBrand && matchesType && matchesPrice;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return toNumber(a.dailyPrice) - toNumber(b.dailyPrice);
                case 'price-high':
                    return toNumber(b.dailyPrice) - toNumber(a.dailyPrice);
                case 'newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'popular':
                    return (b.availableCount || 0) - (a.availableCount || 0);
                default:
                    return `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`);
            }
        })
        .map((item) => ({
            id: item.id,
            name: `${item.brand || ''} ${item.name || ''}`.trim(),
            brand: item.brand,
            model: item.model,
            dailyRate: toNumber(item.dailyPrice),
            imageUrl: item.primaryImageUrl || item.imageUrls?.[0] || '',
            trips: item.availableCount || item.vehicleCount || 0,
            location: 'Ho Chi Minh City',
            discount: null,
            delivery: false,
            isElectric: true
        }));

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedBrand('ALL');
        setSelectedType('ALL');
        setPriceRange('ALL');
        setSortBy('popular');
    };

    const hasActiveFilters =
        searchTerm || selectedBrand !== 'ALL' || selectedType !== 'ALL' || priceRange !== 'ALL';

    return (
        <div className="min-h-screen bg-[#f6f6f6]">
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Link to="/" className="hover:text-[#5fcf86]">Home</Link>
                        <ChevronRight size={14} />
                        <span className="font-medium text-[#141414]">Vehicle Types</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#141414]">Choose Vehicle Type</h1>
                    <p className="text-gray-500 mt-1">
                        {filteredVehicleTypes.length} types available
                        {searching && <span className="ml-2 text-[#5fcf86]">Updating...</span>}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <aside className="hidden lg:block w-[310px] flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-5">
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

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Brand, model, plate..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20 outline-none transition-all"
                                    />
                                    {searching && (
                                        <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#5fcf86]" />
                                    )}
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Brand</label>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                                    {brands.map((brand) => (
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

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Vehicle Type</label>
                                <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
                                    {types.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-all ${selectedType === type
                                                ? 'border-[#5fcf86] bg-[#5fcf86]/10 text-[#22884e]'
                                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <span>{type === 'ALL' ? 'All Types' : type}</span>
                                            {type !== 'ALL' && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200">
                                                    {typeCountMap.get(type) || 0}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                                <div className="space-y-2">
                                    {PRICE_RANGES.map((range) => (
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

                    <main className="flex-1">
                        <div className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Brand, model, plate..."
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

                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                    <select
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                                    >
                                        {brands.map((brand) => (
                                            <option key={brand} value={brand}>
                                                {brand === 'ALL' ? 'All Brands' : brand}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                                    >
                                        {types.map((type) => (
                                            <option key={type} value={type}>
                                                {type === 'ALL' ? 'All Types' : type}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                                    >
                                        {PRICE_RANGES.map((range) => (
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

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
                            <p className="text-gray-600 text-sm">
                                <span className="font-bold text-[#141414]">{filteredVehicleTypes.length}</span> types found
                            </p>
                            <div className="flex items-center gap-2">
                                {searching && <Loader2 size={16} className="animate-spin text-[#5fcf86]" />}
                                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#5fcf86] outline-none bg-white"
                                >
                                    <option value="popular">Most Available</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-[#5fcf86] mb-4" />
                                <p className="text-gray-500">Loading vehicle types...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-500 mb-4">{error}</p>
                                <button
                                    onClick={loadInitialData}
                                    className="px-6 py-2 bg-[#5fcf86] text-white rounded-lg font-semibold hover:bg-[#4bc076] transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredVehicleTypes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredVehicleTypes.map((car) => (
                                    <CarCard key={car.id} car={car} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <Car className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-[#141414] mb-2">No vehicle type found</h3>
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
