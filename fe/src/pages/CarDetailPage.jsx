import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    AlertCircle,
    Armchair,
    BadgeCheck,
    CarFront,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Fuel,
    Gauge,
    Headphones,
    Heart,
    Loader2,
    MapPin,
    Share2,
    ShieldCheck,
    Sparkles,
    Star,
    Truck,
    Zap
} from 'lucide-react';

import BookingWizardModal from '../components/BookingWizardModal';
import { useAuth } from '../context/AuthContext';
import vehicleCategoryService from '../services/vehicleCategoryService';
import vehicleService from '../services/vehicleService';
import bookingService from '../services/bookingService';
import { formatPrice } from '../utils/formatters';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7';
const SERVICE_FEE = 45000;
const INSURANCE_FEES = {
    vehicleDamage: 50000,
    thirdParty: 25000,
    personalAccident: 30000,
    theft: 40000
};
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const formatIsoDate = (value) => {
    if (!value || typeof value !== 'string') return value;
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const toIsoDate = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const addDays = (isoDate, days) => {
    const date = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return isoDate;
    date.setDate(date.getDate() + days);
    return toIsoDate(date);
};

const enumerateRangeDates = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    const dates = [];
    let cursor = startDate;
    while (cursor < endDate) {
        dates.push(cursor);
        cursor = addDays(cursor, 1);
    }
    if (dates.length === 0 && startDate === endDate) {
        dates.push(startDate);
    }
    return dates;
};

const buildCalendarCells = (monthDate) => {
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const leadingEmpty = monthStart.getDay();
    const totalFilled = leadingEmpty + daysInMonth;
    const trailingEmpty = (7 - (totalFilled % 7)) % 7;

    const emptyCells = (count) =>
        Array.from({ length: count }, (_, index) => ({
            key: `empty-${count}-${index}`,
            date: null,
            iso: '',
            day: '',
            isPlaceholder: true
        }));

    const monthCells = Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), index + 1);
        return {
            key: toIsoDate(date),
            date,
            iso: toIsoDate(date),
            day: date.getDate(),
            isPlaceholder: false
        };
    });

    return [...emptyCells(leadingEmpty), ...monthCells, ...emptyCells(trailingEmpty)];
};

const buildDisplayCar = (category) => {
    if (!category) return null;
    const images = (category.imageUrls?.length ? category.imageUrls : [category.primaryImageUrl]).filter(Boolean);
    const baseName = `${category.brand || ''} ${category.name || ''}`.trim();
    const modelName = (category.model || '').trim();
    const hasModelInBaseName =
        modelName &&
        baseName.toLowerCase().includes(modelName.toLowerCase());
    const displayName =
        modelName && !hasModelInBaseName
            ? `${baseName} - ${modelName}`
            : baseName || modelName || 'Unknown Vehicle';

    return {
        id: category.id,
        categoryId: category.id,
        name: displayName,
        categoryName: category.name || '',
        brand: category.brand || '',
        model: category.model || '',
        price: toNumber(category.dailyPrice),
        dailyRate: toNumber(category.dailyPrice),
        range: category.rangeKm || 0,
        battery: category.batteryCapacityKwh ? `${category.batteryCapacityKwh} kWh` : '75 kWh',
        seats: category.seats || 5,
        transmission: 'Automatic',
        charging: 'Type 2 / CCS2',
        images: images.length > 0 ? images : [FALLBACK_IMAGE],
        imageUrl: images[0] || FALLBACK_IMAGE,
        rating: 5.0,
        reviews: 0,
        year: 2024,
        description: category.description || '',
        overtimeFeePerHour: toNumber(category.overtimeFeePerHour)
    };
};

const getInitialVehicleId = (vehicles, preferredVehicleId) => {
    if (!Array.isArray(vehicles) || vehicles.length === 0) return null;
    if (preferredVehicleId && vehicles.some((vehicle) => vehicle.id === preferredVehicleId)) {
        return preferredVehicleId;
    }
    return vehicles[0]?.id || null;
};

const CarDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, refreshUser } = useAuth();

    const [category, setCategory] = useState(null);
    const [vehiclesInCategory, setVehiclesInCategory] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [unavailableRanges, setUnavailableRanges] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [pageError, setPageError] = useState('');
    const [bookingError, setBookingError] = useState('');
    const [showWizard, setShowWizard] = useState(false);
    const [pricingInfo, setPricingInfo] = useState(null);
    const [driverDailyFee, setDriverDailyFee] = useState(null);

    const [selectedDates, setSelectedDates] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [insuranceOptions, setInsuranceOptions] = useState({
        vehicleDamage: true,
        thirdParty: true,
        personalAccident: false,
        theft: false
    });

    const today = new Date().toISOString().split('T')[0];
    const displayCar = useMemo(() => buildDisplayCar(category), [category]);

    const selectedVehicle = useMemo(
        () => vehiclesInCategory.find((vehicle) => vehicle.id === selectedVehicleId) || null,
        [vehiclesInCategory, selectedVehicleId]
    );

    const bookingCar = useMemo(() => {
        if (!displayCar || !selectedVehicle) return null;
        return {
            ...displayCar,
            id: selectedVehicle.id,
            licensePlate: selectedVehicle.licensePlate,
            status: selectedVehicle.status
        };
    }, [displayCar, selectedVehicle]);

    const rentalDays = selectedDates.length > 0 ? selectedDates.length : 1;
    const pickupDate = selectedDates[0] || '';
    const dropoffDate = selectedDates.length > 0 ? selectedDates[selectedDates.length - 1] : '';
    const rentalFee = bookingCar ? bookingCar.price * rentalDays : 0;

    const calculateInsuranceFee = () => {
        let total = INSURANCE_FEES.thirdParty * rentalDays;
        if (insuranceOptions.vehicleDamage) total += INSURANCE_FEES.vehicleDamage * rentalDays;
        if (insuranceOptions.personalAccident) total += INSURANCE_FEES.personalAccident * rentalDays;
        if (insuranceOptions.theft) total += INSURANCE_FEES.theft * rentalDays;
        return total;
    };

    const insuranceFee = calculateInsuranceFee();
    const serviceFee = SERVICE_FEE;
    const totalPrice = rentalFee + insuranceFee + serviceFee;
    const driverPickupFreeKm = Number(pricingInfo?.deliveryFreeKm);
    const driverPickupPerKmRate = Number(pricingInfo?.deliveryPerKmRate);
    const resolvedDriverPickupFreeKm = Number.isFinite(driverPickupFreeKm) ? driverPickupFreeKm : 5;
    const resolvedDriverPickupPerKmRate = Number.isFinite(driverPickupPerKmRate) ? driverPickupPerKmRate : 5000;

    const unavailableDateStatusMap = useMemo(() => {
        const dateStatusMap = new Map();
        unavailableRanges.forEach((range) => {
            const status = range.status || 'BOOKED';
            enumerateRangeDates(range.startDate, range.endDate).forEach((date) => {
                if (!dateStatusMap.has(date)) {
                    dateStatusMap.set(date, status);
                }
            });
        });
        return dateStatusMap;
    }, [unavailableRanges]);

    const unavailableDateSet = useMemo(
        () => new Set(Array.from(unavailableDateStatusMap.keys())),
        [unavailableDateStatusMap]
    );

    const calendarCells = useMemo(() => buildCalendarCells(calendarMonth), [calendarMonth]);
    const calendarTitle = useMemo(
        () => calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        [calendarMonth]
    );

    const isDateUnavailable = (date) => {
        if (!date) return false;
        return unavailableDateSet.has(date);
    };

    const validateDates = () => {
        if (!selectedVehicle) return 'Please select a vehicle license plate';
        if (selectedDates.length === 0) return 'Please select at least one rental day';
        if (selectedDates.some((date) => date < today)) {
            return 'Selected dates cannot be in the past';
        }
        if (selectedDates.some((date) => isDateUnavailable(date))) {
            return 'Some selected dates are already booked for this vehicle';
        }
        return null;
    };

    const toggleSelectedDate = (value) => {
        if (!value) {
            setBookingError('');
            return;
        }
        if (value < today) {
            setBookingError('Selected date cannot be in the past');
            return;
        }
        if (isDateUnavailable(value)) {
            setBookingError('This date is already booked for the selected vehicle');
            return;
        }

        setSelectedDates((prev) => {
            const exists = prev.includes(value);
            const next = exists ? prev.filter((d) => d !== value) : [...prev, value];
            return next.sort();
        });
        setBookingError('');
    };

    const handleBookNow = async () => {
        if (!isAuthenticated || !user) {
            navigate('/login', { state: { from: `/vehicles/${id}` } });
            return;
        }

        const validationError = validateDates();
        if (validationError) {
            setBookingError(validationError);
            return;
        }
        setBookingError('');
        setShowWizard(true);
    };

    const goPrevMonth = () => {
        setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goNextMonth = () => {
        setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleBookingComplete = (result) => {
        setShowWizard(false);
        navigate('/booking-success', {
            state: {
                booking: result,
                vehicle: bookingCar
            }
        });
    };

    useEffect(() => {
        let cancelled = false;

        const fetchDetailData = async () => {
            setLoading(true);
            setPageError('');
            setShowWizard(false);
            setBookingError('');

            try {
                let resolvedCategory = null;
                let resolvedVehicles = [];
                let preferredVehicleId = null;

                try {
                    const [categoryRaw, categoryVehicles] = await Promise.all([
                        vehicleCategoryService.getById(id),
                        vehicleService.getByCategory(id)
                    ]);
                    resolvedCategory = vehicleCategoryService.normalizeCategory(categoryRaw);
                    resolvedVehicles = categoryVehicles;
                } catch (categoryError) {
                    const vehicle = await vehicleService.getById(id);
                    if (!vehicle?.categoryId) {
                        throw categoryError;
                    }
                    preferredVehicleId = vehicle.id;
                    const [categoryRaw, categoryVehicles] = await Promise.all([
                        vehicleCategoryService.getById(vehicle.categoryId),
                        vehicleService.getByCategory(vehicle.categoryId)
                    ]);
                    resolvedCategory = vehicleCategoryService.normalizeCategory(categoryRaw);
                    resolvedVehicles = categoryVehicles;
                }

                const normalizedVehicles = Array.isArray(resolvedVehicles)
                    ? resolvedVehicles
                    : vehicleService.normalizeVehicleList(resolvedVehicles);
                const bookableVehicles = normalizedVehicles.filter((vehicle) => vehicle.status === 'AVAILABLE');
                const initialVehicleId = getInitialVehicleId(bookableVehicles, preferredVehicleId);

                if (cancelled) return;
                setCategory(resolvedCategory);
                setVehiclesInCategory(bookableVehicles);
                setSelectedVehicleId(initialVehicleId);
                setUnavailableRanges([]);
                setSelectedDates([]);
                setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                setActiveImage(0);
            } catch (error) {
                console.error('Failed to load detail page:', error);
                if (cancelled) return;
                setCategory(null);
                setVehiclesInCategory([]);
                setSelectedVehicleId(null);
                setUnavailableRanges([]);
                setPageError('Vehicle type not found');
            } finally {
                if (cancelled) return;
                setLoading(false);
            }
        };

        if (id) {
            fetchDetailData();
        }

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        const fetchUnavailableDates = async () => {
            if (!selectedVehicleId) {
                setUnavailableRanges([]);
                return;
            }
            try {
                const ranges = await vehicleService.getUnavailableDates(selectedVehicleId);
                if (cancelled) return;
                setUnavailableRanges(ranges);
            } catch (error) {
                console.error('Failed to load unavailable dates:', error);
                // Keep previous unavailable ranges to avoid allowing invalid date picks.
            }
        };

        fetchUnavailableDates();
        const refreshTimer = setInterval(() => {
            void fetchUnavailableDates();
        }, 15000);

        return () => {
            cancelled = true;
            clearInterval(refreshTimer);
        };
    }, [selectedVehicleId, calendarMonth]);

    useEffect(() => {
        if (isAuthenticated) {
            void refreshUser();
        }
    }, [isAuthenticated, refreshUser]);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const data = await bookingService.getPricingInfo();
                setPricingInfo(data);
            } catch (err) {
                console.error('Failed to load pricing info:', err);
            }
        };
        fetchPricing();
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchDriverDailyFee = async () => {
            const categoryId = Number(displayCar?.categoryId);
            const fallbackFee = Number(pricingInfo?.driverDailyFee);

            if (!Number.isFinite(categoryId) || categoryId <= 0) {
                if (!cancelled) {
                    setDriverDailyFee(Number.isFinite(fallbackFee) ? fallbackFee : null);
                }
                return;
            }

            try {
                const feeData = await bookingService.getDriverFee(1, categoryId);
                if (cancelled) return;

                const resolvedDailyFee = Number(feeData?.dailyFee);
                if (Number.isFinite(resolvedDailyFee) && resolvedDailyFee > 0) {
                    setDriverDailyFee(resolvedDailyFee);
                } else {
                    setDriverDailyFee(Number.isFinite(fallbackFee) ? fallbackFee : null);
                }
            } catch (error) {
                console.error('Failed to load category driver daily fee:', error);
                if (!cancelled) {
                    setDriverDailyFee(Number.isFinite(fallbackFee) ? fallbackFee : null);
                }
            }
        };

        fetchDriverDailyFee();
        return () => {
            cancelled = true;
        };
    }, [displayCar?.categoryId, pricingInfo?.driverDailyFee]);

    const handleVehicleSelect = (value) => {
        const nextVehicleId = Number(value);
        setSelectedVehicleId(Number.isFinite(nextVehicleId) ? nextVehicleId : null);
        setSelectedDates([]);
        setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setBookingError('');
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5fcf86] border-t-transparent"></div>
            </div>
        );
    }

    if (!displayCar) {
        return (
            <div className="text-center py-20">
                <p className="text-lg text-gray-700">{pageError || 'Vehicle type not found'}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:px-6">
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <Link to="/" className="hover:text-[#5fcf86]">Home</Link>
                <ChevronRight size={14} />
                <Link to="/vehicles" className="hover:text-[#5fcf86]">Fleet</Link>
                <ChevronRight size={14} />
                <span className="font-medium text-gray-900">{displayCar.name}</span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                            <img
                                src={displayCar.images[activeImage] || displayCar.images[0]}
                                alt={displayCar.name}
                                className="h-full w-full object-cover transition-all duration-300"
                            />
                            <div className="absolute top-4 left-4 bg-[#5fcf86] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                <Zap size={14} />
                                Electric
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {displayCar.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activeImage === index ? 'border-[#5fcf86] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={image} alt="Thumb" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-[#141414]">{displayCar.name}</h1>
                            <div className="flex items-center gap-3">
                                <button className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                    <Heart size={20} />
                                </button>
                                <button className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={16} fill="currentColor" />
                                <span className="font-bold text-gray-900">{displayCar.rating}</span>
                                <span className="text-gray-400">({displayCar.reviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Gauge size={16} className="text-[#5fcf86]" />
                                <span className="font-medium text-gray-900">{displayCar.range}km</span> range
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin size={16} className="text-blue-500" />
                                <span>Ho Chi Minh City</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                        <h3 className="mb-4 text-lg font-bold text-[#141414]">Technical Specs</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Armchair className="mb-2 text-gray-400" size={24} />
                                <p className="text-xs text-gray-500">Seats</p>
                                <p className="font-semibold text-[#141414]">{displayCar.seats} seats</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Truck className="mb-2 text-gray-400" size={24} />
                                <p className="text-xs text-gray-500">Transmission</p>
                                <p className="font-semibold text-[#141414]">{displayCar.transmission}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Zap className="mb-2 text-[#5fcf86]" size={24} />
                                <p className="text-xs text-gray-500">Battery</p>
                                <p className="font-semibold text-[#141414]">{displayCar.battery}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Fuel className="mb-2 text-blue-500" size={24} />
                                <p className="text-xs text-gray-500">Charging</p>
                                <p className="font-semibold text-[#141414] truncate" title={displayCar.charging}>
                                    {displayCar.charging}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-lg font-bold text-[#141414]">Description</h3>
                        <p className="leading-relaxed text-gray-600">
                            {displayCar.description || `Experience premium electric driving with ${displayCar.name}.`}
                        </p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Delivery & Additional Services Pricing */}
                    {pricingInfo && (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6 md:p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5fcf86]/15 text-[#2f8e59]">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-gray-800">Delivery & Additional Services</h3>
                                    <p className="text-sm text-gray-600">Optional add-ons available during booking</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Delivery Fee */}
                                <div className="h-full rounded-2xl border border-gray-200 bg-white p-4">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                                <MapPin size={16} />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">Self Delivery</span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-3">
                                        <div className="flex items-center justify-between py-2.5">
                                            <span className="text-xs font-medium text-gray-500">Base fee</span>
                                            <span className="text-base font-bold text-gray-800">{formatPrice(pricingInfo.deliveryBaseFee)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5">
                                            <span className="text-xs font-medium text-gray-500">Within {pricingInfo.deliveryFreeKm} km</span>
                                            <span className="text-sm font-semibold text-gray-800">No extra charge</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5">
                                            <span className="text-xs font-medium text-gray-500">Over {pricingInfo.deliveryFreeKm} km</span>
                                            <span className="text-sm font-semibold text-gray-800">+ {formatPrice(pricingInfo.deliveryPerKmRate)}/km</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs leading-relaxed text-gray-500">
                                        We can deliver the vehicle to your address. Store pickup is always free.
                                    </p>
                                </div>

                                {/* Driver Fee */}
                                <div className="h-full rounded-2xl border border-gray-200 bg-white p-4">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">Chauffeur Driver</span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-3">
                                        <div className="flex items-center justify-between py-2.5">
                                            <span className="text-xs font-medium text-gray-500">Daily fee</span>
                                            <span className="text-base font-bold text-gray-800">
                                                {driverDailyFee !== null ? `${formatPrice(driverDailyFee)}/day` : 'Updating...'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5">
                                            <span className="text-xs font-medium text-gray-500">Within {resolvedDriverPickupFreeKm} km</span>
                                            <span className="text-sm font-semibold text-[#2f8e59]">Free pickup</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2.5">
                                            <span className="text-xs font-medium text-gray-500">Over {resolvedDriverPickupFreeKm} km</span>
                                            <span className="text-sm font-semibold text-gray-800">+ {formatPrice(resolvedDriverPickupPerKmRate)}/km</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs leading-relaxed text-gray-500">
                                        Our experienced driver will take you wherever you need. Includes fuel and tolls.
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 text-center text-xs text-gray-500">
                                Final fees are calculated during booking based on your selected options.
                            </p>
                        </div>
                    )}

                    <hr className="border-gray-100" />

                    <div className="bg-gradient-to-br from-[#5fcf86]/10 to-[#5fcf86]/5 rounded-2xl p-6 border border-[#5fcf86]/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#5fcf86] rounded-xl flex items-center justify-center">
                                <CarFront className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#141414]">E-Fleet Guarantee</h3>
                                <p className="text-sm text-gray-500">Top-tier Service Quality</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                                <Sparkles className="text-[#5fcf86] mt-0.5" size={20} />
                                <div>
                                    <p className="font-semibold text-[#141414] text-sm">New Vehicles</p>
                                    <p className="text-xs text-gray-500">Regularly maintained</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                                <BadgeCheck className="text-[#5fcf86] mt-0.5" size={20} />
                                <div>
                                    <p className="font-semibold text-[#141414] text-sm">Sparkling Clean</p>
                                    <p className="text-xs text-gray-500">Sanitized after every trip</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                                <Headphones className="text-[#5fcf86] mt-0.5" size={20} />
                                <div>
                                    <p className="font-semibold text-[#141414] text-sm">24/7 Support</p>
                                    <p className="text-xs text-gray-500">Hotline: 1900 1234</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
                        <div className="mb-6">
                            <span className="text-sm text-gray-500">Daily Rate</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-[#5fcf86]">{formatPrice(displayCar.price)}</span>
                                <span className="text-sm text-gray-400">/ day</span>
                            </div>
                            {displayCar.overtimeFeePerHour > 0 && (
                                <div className="mt-3 flex items-center gap-2 text-orange-700 bg-orange-50 border border-orange-200 px-4 py-3 rounded-xl">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <div>
                                        <span className="font-medium">Late Return Fee:</span>
                                        <span className="ml-1 text-lg font-bold">{formatPrice(displayCar.overtimeFeePerHour)}</span>
                                        <span className="text-sm">/hour</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {bookingError && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle size={16} />
                                {bookingError}
                            </div>
                        )}

                        <div className="mb-4 rounded-lg bg-blue-50 p-3">
                            {isAuthenticated && user ? (
                                <>
                                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Book as</p>
                                    <p className="font-medium text-gray-900">{user.fullName}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>

                                    <div className="mt-2 pt-2 border-t border-blue-100">
                                        <p className="text-xs text-gray-500 mb-1">Driver's License:</p>
                                        {user.licenseStatus === 'APPROVED' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                <CheckCircle2 size={12} /> Verified
                                            </span>
                                        ) : user.licenseStatus === 'PENDING' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                                <AlertCircle size={12} /> Pending Review
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                                <AlertCircle size={12} /> Not Uploaded
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs font-semibold text-orange-600 uppercase mb-1">Not Logged In</p>
                                    <p className="text-sm text-gray-600">
                                        Please <Link to="/login" className="text-[#5fcf86] font-medium hover:underline">log in</Link> to book.
                                    </p>
                                </>
                            )}
                        </div>

                        {isAuthenticated && user && user.licenseStatus !== 'APPROVED' && (
                            <div className="mb-4 rounded-lg bg-orange-50 border border-orange-200 p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-orange-500 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-medium text-orange-800 text-sm">Driver's License Required</p>
                                        <p className="text-xs text-orange-600 mt-1">
                                            {user.licenseStatus === 'PENDING'
                                                ? 'Your license is being reviewed. Please wait for approval before booking.'
                                                : 'Please upload your driver license to book a vehicle.'}
                                        </p>
                                        {user.licenseStatus !== 'PENDING' && (
                                            <Link
                                                to="/profile"
                                                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-orange-700 hover:text-orange-800 underline"
                                            >
                                                Upload License
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-5 p-4 border border-gray-200 rounded-xl bg-gray-50">
                            <label className="text-xs font-bold uppercase text-gray-500 block mb-2">
                                Select Vehicle License Plate
                            </label>
                            <select
                                value={selectedVehicleId || ''}
                                onChange={(e) => handleVehicleSelect(e.target.value)}
                                className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#5fcf86]"
                            >
                                {vehiclesInCategory.length === 0 && (
                                    <option value="" disabled>
                                        No available vehicle
                                    </option>
                                )}
                                {vehiclesInCategory.map((vehicle) => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.licensePlate}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="mb-6 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Select Rental Days (single calendar, multi-select)
                                </label>
                                <div className="rounded-xl border border-gray-200 bg-white p-3">
                                    <div className="mb-3 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={goPrevMonth}
                                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-sm font-semibold text-gray-800">{calendarTitle}</span>
                                        <button
                                            type="button"
                                            onClick={goNextMonth}
                                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    <div className="mb-1 grid grid-cols-7 gap-1">
                                        {WEEKDAY_LABELS.map((day) => (
                                            <div key={day} className="py-1 text-center text-[10px] font-semibold uppercase text-gray-400">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarCells.map((cell, index) => {
                                            if (cell.isPlaceholder) {
                                                return <div key={`${cell.key}-${index}`} className="h-9" aria-hidden="true" />;
                                            }

                                            const isPast = cell.iso < today;
                                            const unavailable = isDateUnavailable(cell.iso);
                                            const selected = selectedDates.includes(cell.iso);
                                            const disabled = isPast || unavailable;

                                            let dayClass = 'border-gray-100 text-gray-700 hover:border-[#5fcf86]/40 hover:bg-green-50';
                                            if (disabled) {
                                                dayClass = unavailable
                                                    ? 'border-gray-200 bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed';
                                            }
                                            if (selected) {
                                                dayClass = 'border-[#5fcf86] bg-[#5fcf86] text-white font-bold shadow-sm';
                                            }

                                            return (
                                                <button
                                                    key={cell.key}
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => toggleSelectedDate(cell.iso)}
                                                    className={`h-9 rounded-md border text-sm transition-colors ${dayClass}`}
                                                    title={unavailable ? `${cell.iso} (booked)` : cell.iso}
                                                >
                                                    {cell.day}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium text-gray-600 sm:grid-cols-4">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3.5 w-3.5 rounded-[4px] border border-gray-200 bg-white" />
                                            <span>Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-3.5 w-3.5 rounded-[4px] border border-[#5fcf86] bg-[#5fcf86]" />
                                            <span>Selected</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-3.5 w-3.5 rounded-[4px] border border-gray-200 bg-gray-200" />
                                            <span>Booked</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-3.5 w-3.5 rounded-[4px] border border-gray-100 bg-gray-50" />
                                            <span>Past</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-600 uppercase">Selected Days</span>
                                    <span className="text-xs text-[#5fcf86] font-semibold">{selectedDates.length} day(s)</span>
                                </div>
                                {selectedDates.length === 0 ? (
                                    <p className="text-xs text-gray-500">No day selected yet</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDates.map((date) => (
                                            <button
                                                key={date}
                                                type="button"
                                                onClick={() => toggleSelectedDate(date)}
                                                className="px-2 py-1 rounded-md text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                                title="Click to remove"
                                            >
                                                {formatIsoDate(date)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-6 space-y-3 border-t border-gray-100 pt-4 text-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-gray-800 font-medium">Rental Fee</span>
                                    <p className="text-sm text-gray-500">{formatPrice(displayCar.price)} x {rentalDays} days</p>
                                </div>
                                <span className="font-semibold text-gray-900">{formatPrice(rentalFee)}</span>
                            </div>

                            <div className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-800 font-medium text-sm uppercase tracking-wide">Insurance</span>
                                    <span className="text-sm text-gray-500">{formatPrice(insuranceFee)}</span>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-gray-700 text-sm font-medium">Third Party Liability</span>
                                            <span className="text-[10px] text-white bg-red-500 px-1 py-0.5 rounded">Required</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Compensation for third-party damages</p>
                                    </div>
                                    <span className="text-sm text-gray-600">{formatPrice(INSURANCE_FEES.thirdParty * rentalDays)}</span>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <div className="flex-1">
                                        <span className="text-gray-700 text-sm font-medium">Vehicle Body</span>
                                        <p className="text-xs text-gray-500">Scratches, dents, collisions</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${insuranceOptions.vehicleDamage ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {formatPrice(INSURANCE_FEES.vehicleDamage * rentalDays)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setInsuranceOptions({ ...insuranceOptions, vehicleDamage: !insuranceOptions.vehicleDamage })}
                                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${insuranceOptions.vehicleDamage ? 'bg-[#5fcf86]' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 mt-0.5 ${insuranceOptions.vehicleDamage ? 'translate-x-3.5 ml-0' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <div className="flex-1">
                                        <span className="text-gray-700 text-sm font-medium">Personal Accident</span>
                                        <p className="text-xs text-gray-500">Medical expenses for driver and passengers</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${insuranceOptions.personalAccident ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {formatPrice(INSURANCE_FEES.personalAccident * rentalDays)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setInsuranceOptions({ ...insuranceOptions, personalAccident: !insuranceOptions.personalAccident })}
                                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${insuranceOptions.personalAccident ? 'bg-[#5fcf86]' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 mt-0.5 ${insuranceOptions.personalAccident ? 'translate-x-3.5 ml-0' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-1.5">
                                    <div className="flex-1">
                                        <span className="text-gray-700 text-sm font-medium">Vehicle Theft</span>
                                        <p className="text-xs text-gray-500">Compensation for stolen vehicle</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${insuranceOptions.theft ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {formatPrice(INSURANCE_FEES.theft * rentalDays)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setInsuranceOptions({ ...insuranceOptions, theft: !insuranceOptions.theft })}
                                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${insuranceOptions.theft ? 'bg-[#5fcf86]' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 mt-0.5 ${insuranceOptions.theft ? 'translate-x-3.5 ml-0' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-gray-800 font-medium">Service Fee</span>
                                    <p className="text-sm text-gray-500">24/7 support, car cleaning</p>
                                </div>
                                <span className="font-semibold text-gray-900">{formatPrice(serviceFee)}</span>
                            </div>

                            <div className="border-t border-gray-200"></div>

                            <div className="flex justify-between items-center pt-1">
                                <span className="text-gray-900 font-bold text-base">Total</span>
                                <span className="text-[#5fcf86] font-bold text-xl">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleBookNow}
                            disabled={!selectedVehicle || (isAuthenticated && user?.licenseStatus !== 'APPROVED')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5fcf86] py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#4bc076] hover:shadow-[#5fcf86]/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {!isAuthenticated ? (
                                <>
                                    <CheckCircle2 size={20} />
                                    Login to Book
                                </>
                            ) : user?.licenseStatus !== 'APPROVED' ? (
                                <>
                                    <AlertCircle size={20} />
                                    License Required
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Book Now
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <ShieldCheck size={14} />
                            <span>100% Secure Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            <BookingWizardModal
                isOpen={showWizard}
                onClose={() => setShowWizard(false)}
                car={bookingCar}
                pickupDate={pickupDate}
                dropoffDate={dropoffDate}
                selectedDates={selectedDates}
                user={user}
                onBookingComplete={handleBookingComplete}
                insuranceOptions={insuranceOptions}
                insuranceFee={insuranceFee}
                serviceFee={serviceFee}
            />
        </div>
    );
};

export default CarDetailPage;
