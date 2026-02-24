import { useState, useEffect } from 'react';
import {
    X, Car, User, MapPin, Store, Truck, CheckCircle2, AlertCircle,
    Loader2, ChevronRight, ChevronLeft, Calculator
} from 'lucide-react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import bookingService from '../services/bookingService';
import { formatPrice } from '../utils/formatters';

const SHOWROOM_LOCATION = {
    lat: 10.8751371,
    lon: 106.8014554,
    address: 'No. 1 Luu Huu Phuoc, Dong Hoa, Di An, Ho Chi Minh City'
};

const SHOWROOM_COORDINATES = [SHOWROOM_LOCATION.lat, SHOWROOM_LOCATION.lon];

const DeliveryMapEvents = ({ onPickLocation }) => {
    useMapEvents({
        click: (event) => {
            onPickLocation(event.latlng.lat, event.latlng.lng);
        }
    });
    return null;
};

const DeliveryMapViewport = ({ selectedDeliveryPoint }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedDeliveryPoint) {
            map.fitBounds(
                [
                    SHOWROOM_COORDINATES,
                    [selectedDeliveryPoint.lat, selectedDeliveryPoint.lon]
                ],
                { padding: [40, 40] }
            );
            return;
        }

        map.setView(SHOWROOM_COORDINATES, 13);
    }, [map, selectedDeliveryPoint]);

    return null;
};

/**
 * Booking Wizard Modal Component
 * Multi-step wizard for rental type and pickup method selection
 */
const BookingWizardModal = ({
    isOpen,
    onClose,
    car,
    pickupDate,
    dropoffDate,
    selectedDates = [],
    user,
    onBookingComplete
}) => {
    // Wizard state
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Options data
    const [rentalTypes, setRentalTypes] = useState([]);
    const [pickupMethods, setPickupMethods] = useState([]);

    // Selection state
    const [selectedRentalType, setSelectedRentalType] = useState(null);
    const [selectedPickupMethod, setSelectedPickupMethod] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState('');

    // Fee calculation state
    const [driverFeeData, setDriverFeeData] = useState(null);
    const [deliveryFeeData, setDeliveryFeeData] = useState(null);
    const [calculatingFee, setCalculatingFee] = useState(false);
    const [searchingAddress, setSearchingAddress] = useState(false);

    // Delivery location state
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(null); // { lat, lon }
    const [routeData, setRouteData] = useState(null); // { distanceKm, durationMinutes, polyline }

    // Calculate rental days
    const calculateRentalDays = () => {
        if (Array.isArray(selectedDates) && selectedDates.length > 0) return selectedDates.length;
        if (!pickupDate || !dropoffDate) return 1;
        const start = new Date(pickupDate);
        const end = new Date(dropoffDate);
        const diffTime = end - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 1;
    };

    const rentalDays = calculateRentalDays();
    const bookingStartDate = selectedDates.length > 0 ? selectedDates[0] : pickupDate;
    const bookingEndDate = selectedDates.length > 0 ? selectedDates[selectedDates.length - 1] : dropoffDate;
    const rentalFee = car ? car.price * rentalDays : 0;

    const normalizeOptionText = (option) => {
        if (!option) return '';
        if (typeof option === 'string') return option.trim().toUpperCase();
        return `${option.code || ''} ${option.name || ''}`.trim().toUpperCase();
    };

    // Helper functions for flexible code/name matching
    const isWithDriver = (option) => {
        const text = normalizeOptionText(option);
        return text.includes('WITH_DRIVER') || text.includes('WITH DRIVER') || (text.includes('DRIVER') && !text.includes('SELF'));
    };
    const isSelfDrive = (option) => {
        const text = normalizeOptionText(option);
        return text.includes('SELF_DRIVE') || text.includes('SELF DRIVE') || text.includes('SELF');
    };
    const isDelivery = (option) => {
        const text = normalizeOptionText(option);
        return text.includes('DELIVERY');
    };
    const isStorePickup = (option) => {
        const text = normalizeOptionText(option);
        return text.includes('STORE');
    };

    const resetDeliveryState = () => {
        setDeliveryAddress('');
        setDeliveryFeeData(null);
        setAddressSuggestions([]);
        setSelectedDeliveryPoint(null);
        setRouteData(null);
    };

    // Calculate total
    const calculateTotal = () => {
        let total = rentalFee;
        if (isWithDriver(selectedRentalType) && driverFeeData) {
            total += Number(driverFeeData.totalDriverFee) || 0;
        }
        if (isDelivery(selectedPickupMethod) && deliveryFeeData) {
            total += Number(deliveryFeeData.totalDeliveryFee) || 0;
        }
        return total;
    };

    // Fetch rental types and pickup methods on open
    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            // Reset state
            setStep(1);
            setSelectedRentalType(null);
            setSelectedPickupMethod(null);
            setDriverFeeData(null);
            resetDeliveryState();
            setError('');
        }
    }, [isOpen]);

    const fetchOptions = async () => {
        try {
            const [types, methods] = await Promise.all([
                bookingService.getRentalTypes(),
                bookingService.getPickupMethods()
            ]);
            setRentalTypes(types);
            setPickupMethods(methods);
        } catch (err) {
            console.error('Failed to fetch booking options:', err);
            setError('Failed to load booking options. Please try again.');
        }
    };

    // Calculate driver fee when selecting WITH_DRIVER
    const handleRentalTypeSelect = async (type) => {
        setError('');
        setSelectedRentalType(type);
        setSelectedPickupMethod(null);
        resetDeliveryState();

        if (isWithDriver(type)) {
            setCalculatingFee(true);
            setDriverFeeData(null);
            try {
                const categoryId = Number(car?.categoryId);
                const feeData = await bookingService.getDriverFee(
                    rentalDays,
                    Number.isFinite(categoryId) && categoryId > 0 ? categoryId : undefined
                );
                setDriverFeeData(feeData);
            } catch (err) {
                console.error('Failed to calculate driver fee:', err);
                setDriverFeeData(null);
                setError('Unable to calculate driver fee for this vehicle category. Please try again.');
            } finally {
                setCalculatingFee(false);
            }
        } else {
            setDriverFeeData(null);
        }
    };

    // Handle pickup method selection
    const handlePickupMethodSelect = (method) => {
        setSelectedPickupMethod(method);
        if (!isDelivery(method)) {
            resetDeliveryState();
        }
    };

    const handleDeliveryAddressInputChange = (value) => {
        setDeliveryAddress(value);
        setDeliveryFeeData(null);
        setRouteData(null);
        setAddressSuggestions([]);
        setSelectedDeliveryPoint(null);
    };

    const fetchNominatimSearch = async (query, limit = 5) => {
        const params = new URLSearchParams({
            q: query.trim(),
            format: 'jsonv2',
            addressdetails: '1',
            limit: String(limit),
            countrycodes: 'vn'
        });

        const response = await fetch(`/nominatim/search?${params.toString()}`, {
            headers: {
                Accept: 'application/json',
                'Accept-Language': 'en'
            }
        });

        if (!response.ok) {
            throw new Error('Nominatim lookup failed');
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    };

    const searchDeliveryAddress = async () => {
        if (!deliveryAddress.trim()) {
            setError('Please enter a delivery address');
            return;
        }

        setSearchingAddress(true);
        setError('');
        try {
            const data = await fetchNominatimSearch(deliveryAddress, 5);
            if (data.length === 0) {
                setAddressSuggestions([]);
                setError('No matching address found. Please try again.');
                return;
            }

            setAddressSuggestions(data);
        } catch (err) {
            console.error('Failed to search address with Nominatim:', err);
            setError('Unable to search addresses right now. Please try again.');
        } finally {
            setSearchingAddress(false);
        }
    };

    const handleDeliveryAddressKeyDown = (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (searchingAddress || !deliveryAddress.trim()) return;
        searchDeliveryAddress();
    };

    const handleSelectAddressSuggestion = (item) => {
        const lat = Number(item.lat);
        const lon = Number(item.lon);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            setError('Could not read coordinates from the selected address.');
            return;
        }

        setDeliveryAddress(item.display_name || deliveryAddress);
        setAddressSuggestions([]);
        setSelectedDeliveryPoint({ lat, lon });
        setRouteData(null);
        setDeliveryFeeData(null);
        setError('');
    };

    const handlePickLocationOnMap = async (lat, lon) => {
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        setSelectedDeliveryPoint({ lat, lon });
        setRouteData(null);
        setDeliveryFeeData(null);
        setAddressSuggestions([]);
        setError('');

        try {
            const params = new URLSearchParams({
                lat: String(lat),
                lon: String(lon),
                format: 'jsonv2'
            });
            const response = await fetch(`/nominatim/reverse?${params.toString()}`, {
                headers: {
                    Accept: 'application/json',
                    'Accept-Language': 'en'
                }
            });

            if (!response.ok) {
                throw new Error('Nominatim reverse lookup failed');
            }

            const data = await response.json();
            if (data?.display_name) {
                setDeliveryAddress(data.display_name);
            }
        } catch (err) {
            console.error('Failed to reverse geocode location:', err);
        }
    };

    // Calculate OSRM route (km/min) and delivery fee
    const handleCalculateDeliveryFee = async () => {
        if (!deliveryAddress.trim()) {
            setError('Please enter a delivery address.');
            return;
        }
        setCalculatingFee(true);
        setError('');
        try {
            let targetPoint = selectedDeliveryPoint;

            // If user typed an address but did not pick from suggestions/map, auto-geocode first.
            if (!targetPoint) {
                const fallbackSearch = await fetchNominatimSearch(deliveryAddress, 1);
                const first = fallbackSearch[0];
                const lat = Number(first?.lat);
                const lon = Number(first?.lon);
                if (Number.isFinite(lat) && Number.isFinite(lon)) {
                    targetPoint = { lat, lon };
                    setSelectedDeliveryPoint(targetPoint);
                    if (first?.display_name) {
                        setDeliveryAddress(first.display_name);
                    }
                } else {
                    throw new Error('Could not geocode delivery address');
                }
            }

            const routeParams = new URLSearchParams({
                overview: 'full',
                geometries: 'geojson',
                steps: 'false'
            });
            const osrmUrl =
                `/osrm/route/v1/driving/${SHOWROOM_LOCATION.lon},${SHOWROOM_LOCATION.lat};${targetPoint.lon},${targetPoint.lat}?${routeParams.toString()}`;

            const routeResponse = await fetch(osrmUrl, {
                headers: { Accept: 'application/json' }
            });
            if (!routeResponse.ok) {
                throw new Error('OSRM route lookup failed');
            }

            const routePayload = await routeResponse.json();
            const route = routePayload?.routes?.[0];
            if (!route || !route.distance || !route.duration) {
                throw new Error('No route found');
            }

            const distanceKm = Number((route.distance / 1000).toFixed(2));
            const durationMinutes = Math.max(1, Math.round(route.duration / 60));
            const polyline = Array.isArray(route.geometry?.coordinates)
                ? route.geometry.coordinates.map(([lon, lat]) => [lat, lon])
                : [];

            setRouteData({ distanceKm, durationMinutes, polyline });

            const feeData = await bookingService.calculateDeliveryFee(deliveryAddress, distanceKm, isWithDriver(selectedRentalType));
            setDeliveryFeeData(feeData);
        } catch (err) {
            console.error('Failed to calculate OSRM route/delivery fee:', err);

            // Fallback: still calculate a fee from address so user can continue.
            try {
                const fallbackFee = await bookingService.calculateDeliveryFee(deliveryAddress, null, isWithDriver(selectedRentalType));
                setRouteData(null);
                setDeliveryFeeData(fallbackFee);
                setError('Route lookup is unavailable. Delivery fee is calculated using fallback distance.');
            } catch (fallbackErr) {
                console.error('Fallback delivery fee failed:', fallbackErr);
                setRouteData(null);
                setDeliveryFeeData(null);
                setError('Unable to calculate delivery fee right now. Please try again.');
            }
        } finally {
            setCalculatingFee(false);
        }
    };

    // Handle booking submission
    const handleConfirmBooking = async () => {
        setLoading(true);
        setError('');

        try {
            const bookingData = {
                vehicleId: car.id,
                brand: car.brand,
                model: car.model,
                userId: user.id,
                customerName: user.fullName,
                customerEmail: user.email,
                customerPhone: user.phone || '',
                startDate: bookingStartDate,
                endDate: bookingEndDate,
                selectedDates: selectedDates,
                notes: `Booking via website - ${car.name}`,
                rentalTypeId: selectedRentalType?.id,
                pickupMethodId: selectedPickupMethod?.id || null,
                deliveryAddress: deliveryAddress.trim() || null,
                deliveryDistanceKm: routeData?.distanceKm || null
            };

            const result = await bookingService.createBooking(bookingData);
            onBookingComplete(result);
        } catch (err) {
            console.error('Booking failed:', err);
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Navigation helpers
    const canProceedStep1 = () => {
        if (!selectedRentalType) return false;
        if (!isWithDriver(selectedRentalType)) return true;
        return !calculatingFee && driverFeeData !== null;
    };
    const canProceedStep2 = () => {
        if (!selectedPickupMethod) return false;
        if (isDelivery(selectedPickupMethod)) {
            return deliveryFeeData !== null;
        }
        return true;
    };

    const goNext = () => {
        if (step === 1 && canProceedStep1()) {
            setStep(2);
        } else if (step === 2 && canProceedStep2()) {
            setStep(3);
        }
    };

    const goBack = () => {
        if (step === 2) setStep(1);
        if (step === 3) setStep(2);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modern Header */}
                <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Book Vehicle</h2>
                        <div className="flex items-center gap-2 mt-1 text-gray-500">
                            <span className="font-medium text-gray-900">{car?.name}</span>
                            <span>-</span>
                            <span className="text-sm">{selectedDates.length > 0 ? `${selectedDates.length} day(s) selected` : `${pickupDate} to ${dropoffDate}`}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modern Stepper */}
                <div className="px-8 py-6 bg-gray-50/50">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-0"></div>
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#5fcf86] rounded-full -z-0 transition-all duration-500 ease-out"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        ></div>

                        {[
                            { id: 1, label: 'Rental Type', icon: User },
                            { id: 2, label: 'Pickup', icon: MapPin },
                            { id: 3, label: 'Confirm', icon: CheckCircle2 }
                        ].map((s) => {
                            const Icon = s.icon;
                            const isActive = step >= s.id;
                            const isCurrent = step === s.id;

                            return (
                                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive
                                            ? 'bg-[#5fcf86] border-white text-white shadow-lg shadow-green-200 scale-110'
                                            : 'bg-white border-gray-100 text-gray-300'
                                            }`}
                                    >
                                        <Icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isCurrent ? 'text-[#5fcf86]' : isActive ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-fadeIn">
                            <AlertCircle size={20} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Rental Type Selection */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-gray-900">How would you like to rent?</h3>
                                <p className="text-gray-500">Choose the option that suits your journey best</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {rentalTypes.map((type) => {
                                    const selected = selectedRentalType?.id === type.id;
                                    const isSelf = isSelfDrive(type);

                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => handleRentalTypeSelect(type)}
                                            className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${selected
                                                ? 'border-[#5fcf86] bg-green-50/30 ring-4 ring-green-50'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${selected ? 'bg-[#5fcf86] text-white shadow-lg shadow-green-200 rotate-3' : 'bg-gray-100 text-gray-400 group-hover:scale-110'
                                                    }`}>
                                                    {isSelf ? <Car size={28} /> : <User size={28} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className={`text-lg font-bold transition-colors ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {isSelf ? 'Self-Drive' : 'Chauffeur Service'}
                                                        </h4>
                                                        {selected && <CheckCircle2 className="text-[#5fcf86]" size={24} />}
                                                    </div>
                                                    <p className="text-sm text-gray-500 leading-relaxed">
                                                        {isSelf
                                                            ? 'Take full control of your journey. Perfect for privacy and flexibility.'
                                                            : 'Sit back and relax while our professional driver takes you there.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Driver Fee Preview */}
                            {isWithDriver(selectedRentalType) && (
                                <div className="mt-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Driver Fee Included</p>
                                                <p className="text-sm text-gray-500">Professional service per day</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {calculatingFee ? (
                                                <Loader2 size={20} className="animate-spin text-blue-500" />
                                            ) : driverFeeData ? (
                                                <>
                                                    <p className="font-bold text-xl text-blue-600">{formatPrice(driverFeeData.totalDriverFee)}</p>
                                                    <p className="text-xs text-blue-400">Total for {rentalDays} days</p>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Pickup Method */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isWithDriver(selectedRentalType)
                                        ? 'Where should the driver pick you up?'
                                        : 'How would you like to receive the car?'}
                                </h3>
                                <p className="text-gray-500">
                                    {isWithDriver(selectedRentalType)
                                        ? 'Our driver will bring the car to your location'
                                        : 'Choose the option that works best for you'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {pickupMethods.map((method) => {
                                    const selected = selectedPickupMethod?.id === method.id;
                                    const isStore = isStorePickup(method);
                                    const driverMode = isWithDriver(selectedRentalType);

                                    const title = isStore
                                        ? (driverMode ? 'Meet at Showroom' : 'Pick up at Store')
                                        : (driverMode ? 'Driver Pickup' : 'Delivery Service');
                                    const subtitle = isStore
                                        ? 'Free of charge'
                                        : (driverMode ? 'Driver picks you up at your address' : 'Delivered to your door');

                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => handlePickupMethodSelect(method)}
                                            className={`p-6 rounded-2xl border-2 text-center transition-all duration-300 flex flex-col items-center gap-4 ${selected
                                                ? 'border-[#5fcf86] bg-green-50/30 ring-4 ring-green-50'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${selected ? 'bg-[#5fcf86] text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {isStore ? <Store size={26} /> : <Truck size={26} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                                                <p className="text-xs text-gray-500">{subtitle}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Delivery Address Input */}
                            {isDelivery(selectedPickupMethod) && (
                                <div className="mt-8 space-y-4 animate-fadeIn">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin size={18} className="text-[#5fcf86]" />
                                        {isWithDriver(selectedRentalType) ? 'Pickup Location' : 'Delivery Details'}
                                    </h4>

                                    {isWithDriver(selectedRentalType) && (
                                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 flex items-start gap-2">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <span>
                                                Pickup is <strong>free</strong> within <strong>5 km</strong> of our showroom.
                                                Beyond 5 km, a distance-based surcharge applies.
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-sm text-green-800">
                                        <p className="font-semibold">Showroom location</p>
                                        <p>{SHOWROOM_LOCATION.address}</p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={deliveryAddress}
                                                onChange={(e) => handleDeliveryAddressInputChange(e.target.value)}
                                                onKeyDown={handleDeliveryAddressKeyDown}
                                                placeholder={isWithDriver(selectedRentalType)
                                                    ? 'Enter your pickup address...'
                                                    : 'Enter delivery address...'}
                                                className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5fcf86] focus:ring-4 focus:ring-green-50 transition-all text-gray-700 font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={searchDeliveryAddress}
                                                disabled={searchingAddress || !deliveryAddress.trim()}
                                                className="px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
                                            >
                                                {searchingAddress ? <Loader2 size={18} className="animate-spin" /> : 'Find Address'}
                                            </button>
                                        </div>

                                        {addressSuggestions.length > 0 && (
                                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl bg-white divide-y divide-gray-100">
                                                {addressSuggestions.map((item) => (
                                                    <button
                                                        key={item.place_id}
                                                        type="button"
                                                        onClick={() => handleSelectAddressSuggestion(item)}
                                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <p className="text-sm text-gray-700">{item.display_name}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                                        <MapContainer
                                            center={SHOWROOM_COORDINATES}
                                            zoom={13}
                                            className="h-72 w-full"
                                            scrollWheelZoom
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <CircleMarker center={SHOWROOM_COORDINATES} radius={8} pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.9 }}>
                                                <Popup>{SHOWROOM_LOCATION.address}</Popup>
                                            </CircleMarker>
                                            {selectedDeliveryPoint && (
                                                <CircleMarker
                                                    center={[selectedDeliveryPoint.lat, selectedDeliveryPoint.lon]}
                                                    radius={8}
                                                    pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9 }}
                                                >
                                                    <Popup>{deliveryAddress || 'Customer delivery point'}</Popup>
                                                </CircleMarker>
                                            )}
                                            {routeData?.polyline?.length > 1 && (
                                                <Polyline positions={routeData.polyline} pathOptions={{ color: '#f97316', weight: 4 }} />
                                            )}
                                            <DeliveryMapEvents onPickLocation={handlePickLocationOnMap} />
                                            <DeliveryMapViewport selectedDeliveryPoint={selectedDeliveryPoint} />
                                        </MapContainer>
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        Tip: Click directly on the map to select the exact {isWithDriver(selectedRentalType) ? 'pickup' : 'delivery'} point.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleCalculateDeliveryFee}
                                        disabled={calculatingFee || !deliveryAddress.trim()}
                                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {calculatingFee ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Calculator size={18} />
                                                Calculate Distance and Fee
                                            </>
                                        )}
                                    </button>

                                    {routeData && (
                                        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
                                            <p className="text-sm font-semibold text-blue-900">Route Details</p>
                                            <p className="text-sm text-blue-700">
                                                {routeData.distanceKm} km, estimated {routeData.durationMinutes} minutes of travel time.
                                            </p>
                                        </div>
                                    )}

                                    {/* Delivery Fee Result */}
                                    {deliveryFeeData && (
                                        <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                                    <Truck size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {isWithDriver(selectedRentalType) ? 'Pickup Fee' : 'Delivery Fee'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {deliveryFeeData.distanceKm} km
                                                        {routeData?.durationMinutes ? ` | ${routeData.durationMinutes} min` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {Number(deliveryFeeData.totalDeliveryFee) === 0 ? (
                                                    <p className="font-bold text-xl text-green-600">FREE</p>
                                                ) : (
                                                    <p className="font-bold text-xl text-orange-600">{formatPrice(deliveryFeeData.totalDeliveryFee)}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Summary */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Review Booking</h3>

                            <div className="bg-white border text-sm border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-[#5fcf86]"></div>

                                {/* Vehicle Info */}
                                <div className="flex gap-4 items-center">
                                    <img
                                        src={car?.images?.[0] || car?.imageUrl}
                                        alt={car?.name}
                                        className="w-24 h-20 rounded-xl object-cover shadow-sm"
                                    />
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{car?.name}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-gray-500">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold">{car?.brand}</span>
                                            <span className="text-xs">{car?.categoryName || 'Luxury'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 border-dashed border-b border-gray-200"></div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    <div className="space-y-1">
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Duration</p>
                                        <p className="font-semibold text-gray-900">{selectedDates.length > 0 ? selectedDates.join(", ") : `${pickupDate} to ${dropoffDate}`}</p>
                                        <p className="text-xs text-[#5fcf86] font-medium">{rentalDays} Days</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Type</p>
                                        <p className="font-semibold text-gray-900">
                                            {isSelfDrive(selectedRentalType) ? 'Self-Drive' : 'With Driver'}
                                        </p>
                                    </div>

                                    {deliveryAddress && (
                                        <div className="col-span-2 space-y-1">
                                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Delivery To</p>
                                            <p className="font-semibold text-gray-900 truncate">{deliveryAddress}</p>
                                        </div>
                                    )}
                                    {routeData && (
                                        <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
                                            <div className="p-3 rounded-xl bg-blue-50 text-blue-800">
                                                <p className="text-xs uppercase font-bold tracking-wider">Distance</p>
                                                <p className="font-semibold">{routeData.distanceKm} km</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-blue-50 text-blue-800 text-right">
                                                <p className="text-xs uppercase font-bold tracking-wider">Travel Time</p>
                                                <p className="font-semibold">{routeData.durationMinutes} min</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="h-px bg-gray-100 border-dashed border-b border-gray-200"></div>

                                {/* Cost Breakdown */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Rental Fee</span>
                                        <span className="font-medium text-gray-900">{formatPrice(rentalFee)}</span>
                                    </div>

                                    {isWithDriver(selectedRentalType) && driverFeeData && (
                                        <div className="flex justify-between items-center text-blue-600 bg-blue-50/50 p-2 rounded-lg -mx-2">
                                            <span className="flex items-center gap-2 text-sm"><User size={14} /> Driver Fee</span>
                                            <span className="font-bold">{formatPrice(driverFeeData.totalDriverFee)}</span>
                                        </div>
                                    )}

                                    {isDelivery(selectedPickupMethod) && deliveryFeeData && (
                                        <div className="flex justify-between items-center text-orange-600 bg-orange-50/50 p-2 rounded-lg -mx-2">
                                            <span className="flex items-center gap-2 text-sm"><Truck size={14} /> {isWithDriver(selectedRentalType) ? 'Pickup Fee' : 'Delivery Fee'}</span>
                                            <span className="font-bold">{formatPrice(deliveryFeeData.totalDeliveryFee)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="bg-gray-900 text-white p-6 -mx-6 -mb-6 mt-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Total Amount</p>
                                        <p className="text-sm opacity-60">Taxes included</p>
                                    </div>
                                    <span className="text-3xl font-bold tracking-tight">{formatPrice(calculateTotal())}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modern Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-white z-10 flex gap-4">
                    {step > 1 && (
                        <button
                            onClick={goBack}
                            className="px-6 py-4 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                    )}

                    <button
                        onClick={step === 3 ? handleConfirmBooking : goNext}
                        disabled={(step === 1 ? !canProceedStep1() : step === 2 ? !canProceedStep2() : loading)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-100 transition-all transform active:scale-[0.98] ${(step === 1 ? !canProceedStep1() : step === 2 ? !canProceedStep2() : loading)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-[#5fcf86] text-white hover:bg-[#4bc076] hover:shadow-green-200'
                            }`}
                    >
                        {loading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : step === 3 ? (
                            <>Confirm Booking <CheckCircle2 size={24} /></>
                        ) : (
                            <>Continue <ChevronRight size={24} /></>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #f1f1f1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #d1d1d1;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default BookingWizardModal;

