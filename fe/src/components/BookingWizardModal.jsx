import { useState, useEffect } from 'react';
import {
    X, Car, User, MapPin, Store, Truck, CheckCircle2, AlertCircle,
    Loader2, ChevronRight, ChevronLeft, Calculator
} from 'lucide-react';
import bookingService from '../services/bookingService';
import { formatPrice } from '../utils/formatters';

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

    // Calculate rental days
    const calculateRentalDays = () => {
        if (!pickupDate || !dropoffDate) return 1;
        const start = new Date(pickupDate);
        const end = new Date(dropoffDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    };

    const rentalDays = calculateRentalDays();
    const rentalFee = car ? car.price * rentalDays : 0;

    // Helper functions for flexible name matching
    const isWithDriver = (name) => {
        return name && (name.toUpperCase().includes('DRIVER') || name.toLowerCase().includes('tài xế'));
    };
    const isSelfDrive = (name) => {
        return name && (name.toUpperCase().includes('SELF') || name.toLowerCase().includes('tự lái'));
    };
    const isDelivery = (name) => {
        return name && (name.toUpperCase().includes('DELIVERY') || name.toLowerCase().includes('giao'));
    };
    const isStorePickup = (name) => {
        return name && (name.toUpperCase().includes('STORE') || name.toLowerCase().includes('cửa hàng'));
    };

    // Calculate total
    const calculateTotal = () => {
        let total = rentalFee;
        if (isWithDriver(selectedRentalType?.name) && driverFeeData) {
            total += parseFloat(driverFeeData.totalDriverFee) || 0;
        }
        if (isDelivery(selectedPickupMethod?.name) && deliveryFeeData) {
            total += parseFloat(deliveryFeeData.totalDeliveryFee) || 0;
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
            setDeliveryAddress('');
            setDriverFeeData(null);
            setDeliveryFeeData(null);
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
        setSelectedRentalType(type);
        setSelectedPickupMethod(null);
        setDeliveryFeeData(null);

        if (isWithDriver(type.name)) {
            setCalculatingFee(true);
            try {
                const feeData = await bookingService.getDriverFee(rentalDays, car?.categoryId);
                setDriverFeeData(feeData);
            } catch (err) {
                console.error('Failed to calculate driver fee:', err);
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
        if (!isDelivery(method.name)) {
            setDeliveryAddress('');
            setDeliveryFeeData(null);
        }
    };

    // Calculate delivery fee
    const handleCalculateDeliveryFee = async () => {
        if (!deliveryAddress.trim()) {
            setError('Please enter a delivery address');
            return;
        }
        setCalculatingFee(true);
        setError('');
        try {
            const feeData = await bookingService.calculateDeliveryFee(deliveryAddress);
            setDeliveryFeeData(feeData);
        } catch (err) {
            console.error('Failed to calculate delivery fee:', err);
            setError('Failed to calculate delivery fee. Please try again.');
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
                vehicleId: car.id, // Book the specific vehicle being viewed
                brand: car.brand,
                model: car.model,
                userId: user.id,
                customerName: user.fullName,
                customerEmail: user.email,
                customerPhone: user.phone || '',
                startDate: pickupDate,
                endDate: dropoffDate,
                notes: `Booking via website - ${car.name}`,
                rentalTypeId: selectedRentalType?.id,
                pickupMethodId: selectedPickupMethod?.id || null,
                deliveryAddress: deliveryAddress.trim() || null
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
    const canProceedStep1 = selectedRentalType !== null;
    const canProceedStep2 = () => {
        if (isWithDriver(selectedRentalType?.name)) return true;
        if (!selectedPickupMethod) return false;
        if (isDelivery(selectedPickupMethod.name)) {
            return deliveryFeeData !== null;
        }
        return true;
    };

    const goNext = () => {
        if (step === 1 && canProceedStep1) {
            if (isWithDriver(selectedRentalType?.name)) {
                setStep(3); // Skip step 2 for WITH_DRIVER
            } else {
                setStep(2);
            }
        } else if (step === 2 && canProceedStep2()) {
            setStep(3);
        }
    };

    const goBack = () => {
        if (step === 2) setStep(1);
        if (step === 3) {
            if (isWithDriver(selectedRentalType?.name)) {
                setStep(1);
            } else {
                setStep(2);
            }
        }
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
                            <span>•</span>
                            <span className="text-sm">{pickupDate} → {dropoffDate}</span>
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
                                    const isSelf = isSelfDrive(type.name);

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
                            {isWithDriver(selectedRentalType?.name) && (
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
                                <h3 className="text-xl font-bold text-gray-900">Where to get the car?</h3>
                                <p className="text-gray-500">Select convenience or cost-saving</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {pickupMethods.map((method) => {
                                    const selected = selectedPickupMethod?.id === method.id;
                                    const isStore = isStorePickup(method.name);

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
                                                <h4 className="font-bold text-gray-900 mb-1">
                                                    {isStore ? 'Pick up at Store' : 'Delivery Service'}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {isStore ? 'Free of charge' : 'Delivered to your door'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Delivery Address Input */}
                            {isDelivery(selectedPickupMethod?.name) && (
                                <div className="mt-8 space-y-4 animate-fadeIn">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin size={18} className="text-[#5fcf86]" />
                                        Delivery Details
                                    </h4>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={deliveryAddress}
                                            onChange={(e) => {
                                                setDeliveryAddress(e.target.value);
                                                setDeliveryFeeData(null);
                                            }}
                                            placeholder="Enter full delivery address..."
                                            className="w-full pl-4 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5fcf86] focus:ring-4 focus:ring-green-50 transition-all text-gray-700 font-medium"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <button
                                                onClick={handleCalculateDeliveryFee}
                                                disabled={calculatingFee || !deliveryAddress.trim()}
                                                className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                                title="Calculate Fee"
                                            >
                                                {calculatingFee ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delivery Fee Result */}
                                    {deliveryFeeData && (
                                        <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                                    <Truck size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">Delivery Fee Calculated</p>
                                                    <p className="text-sm text-gray-500">{deliveryFeeData.distanceKm} km distance</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl text-orange-600">{formatPrice(deliveryFeeData.totalDeliveryFee)}</p>
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
                                        <p className="font-semibold text-gray-900">{pickupDate} → {dropoffDate}</p>
                                        <p className="text-xs text-[#5fcf86] font-medium">{rentalDays} Days</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Type</p>
                                        <p className="font-semibold text-gray-900">
                                            {isSelfDrive(selectedRentalType?.name) ? 'Self-Drive' : 'With Driver'}
                                        </p>
                                    </div>

                                    {deliveryAddress && (
                                        <div className="col-span-2 space-y-1">
                                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Delivery To</p>
                                            <p className="font-semibold text-gray-900 truncate">{deliveryAddress}</p>
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

                                    {isWithDriver(selectedRentalType?.name) && driverFeeData && (
                                        <div className="flex justify-between items-center text-blue-600 bg-blue-50/50 p-2 rounded-lg -mx-2">
                                            <span className="flex items-center gap-2 text-sm"><User size={14} /> Driver Fee</span>
                                            <span className="font-bold">{formatPrice(driverFeeData.totalDriverFee)}</span>
                                        </div>
                                    )}

                                    {isDelivery(selectedPickupMethod?.name) && deliveryFeeData && (
                                        <div className="flex justify-between items-center text-orange-600 bg-orange-50/50 p-2 rounded-lg -mx-2">
                                            <span className="flex items-center gap-2 text-sm"><Truck size={14} /> Delivery Fee</span>
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
                        disabled={(step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2() : loading)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-100 transition-all transform active:scale-[0.98] ${(step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2() : loading)
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
