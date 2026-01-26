import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Star, MapPin, Zap, Fuel, Gauge, Armchair,
    Calendar, ShieldCheck, CheckCircle2, Share2,
    Heart, ChevronRight, Truck, Loader2, AlertCircle,
    Sparkles, Headphones, BadgeCheck, CarFront
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import vehicleService from '../services/vehicleService';
import bookingService from '../services/bookingService';
import { formatPrice } from '../utils/formatters';

/**
 * B2C Car Detail Page
 * - No owner information (Company owns all vehicles)
 * - Company Guarantee section instead
 */
const CarDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');

    // Date picker state
    const [pickupDate, setPickupDate] = useState('');
    const [dropoffDate, setDropoffDate] = useState('');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

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
    const insuranceFee = 15;
    const serviceFee = 10;
    const totalPrice = rentalFee + insuranceFee + serviceFee;

    // Validate dates
    const validateDates = () => {
        if (!pickupDate || !dropoffDate) {
            return 'Please select pickup and return dates';
        }
        if (pickupDate < today) {
            return 'Pickup date cannot be in the past';
        }
        if (dropoffDate <= pickupDate) {
            return 'Return date must be after pickup date';
        }
        return null;
    };

    // Handle booking submission
    const handleBookNow = async () => {
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
            navigate('/login', { state: { from: `/vehicles/${id}` } });
            return;
        }

        const validationError = validateDates();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setBookingLoading(true);

        try {
            const bookingData = {
                vehicleId: parseInt(id),
                userId: user.id,
                customerName: user.fullName,
                customerEmail: user.email,
                customerPhone: user.phone || '',
                startDate: pickupDate,
                endDate: dropoffDate,
                notes: `Booking via website - ${car.name}`
            };

            const result = await bookingService.createBooking(bookingData);

            navigate('/booking-success', {
                state: {
                    booking: result,
                    vehicle: car
                }
            });
        } catch (err) {
            console.error('Booking failed:', err);
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    useEffect(() => {
        const fetchCar = async () => {
            setLoading(true);
            try {
                const data = await vehicleService.getById(id);
                const mappedCar = {
                    ...data,
                    price: data.dailyRate,
                    range: data.rangeKm,
                    battery: data.batteryCapacityKwh ? `${data.batteryCapacityKwh} kWh` : "75 kWh",
                    seats: data.seats || 5,
                    transmission: "Automatic",
                    charging: "Type 2 / CCS2",
                    images: [data.imageUrl || "https://images.unsplash.com/photo-1593941707882-a5bba14938c7"],
                    rating: 5.0,
                    reviews: 0,
                    year: 2024
                };
                setCar(mappedCar);
            } catch (err) {
                console.error("Failed to load car details:", err);
                setCar(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCar();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5fcf86] border-t-transparent"></div>
            </div>
        );
    }

    if (!car) return <div className="text-center py-20">Vehicle not found</div>;

    return (
        <div className="container mx-auto px-4 py-8 md:px-6">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <Link to="/" className="hover:text-[#5fcf86]">Home</Link>
                <ChevronRight size={14} />
                <Link to="/vehicles" className="hover:text-[#5fcf86]">Fleet</Link>
                <ChevronRight size={14} />
                <span className="font-medium text-gray-900">{car.name}</span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                {/* Left Column: Main Detail */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                            <img
                                src={car.images[activeImage] || car.images[0]}
                                alt={car.name}
                                className="h-full w-full object-cover transition-all duration-300"
                            />
                            {/* Electric Badge */}
                            <div className="absolute top-4 left-4 bg-[#5fcf86] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                <Zap size={14} />
                                Electric
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {car.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activeImage === idx ? 'border-[#5fcf86] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="Thumb" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Car Header Info */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-[#141414]">{car.name}</h1>
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
                                <span className="font-bold text-gray-900">{car.rating}</span>
                                <span className="text-gray-400">({car.reviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Gauge size={16} className="text-[#5fcf86]" />
                                <span className="font-medium text-gray-900">{car.range}km</span> range
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin size={16} className="text-blue-500" />
                                <span>Ho Chi Minh City</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Specs Grid */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-[#141414]">Technical Specs</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Armchair className="mb-2 text-gray-400" size={24} />
                                <p className="text-xs text-gray-500">Seats</p>
                                <p className="font-semibold text-[#141414]">{car.seats} seats</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Truck className="mb-2 text-gray-400" size={24} />
                                <p className="text-xs text-gray-500">Transmission</p>
                                <p className="font-semibold text-[#141414]">{car.transmission}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Zap className="mb-2 text-[#5fcf86]" size={24} />
                                <p className="text-xs text-gray-500">Battery</p>
                                <p className="font-semibold text-[#141414]">{car.battery}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Fuel className="mb-2 text-blue-500" size={24} />
                                <p className="text-xs text-gray-500">Charging</p>
                                <p className="font-semibold text-[#141414] truncate" title={car.charging}>{car.charging}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-[#141414]">Description</h3>
                        <p className="leading-relaxed text-gray-600">
                            {car.description || `Experience the future of driving with ${car.name}. Premium electric vehicle with superior range, advanced technology, and eco-friendly performance.`}
                        </p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* ============ COMPANY GUARANTEE SECTION ============ */}
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
                                    <p className="text-xs text-gray-500">2023-2024 models, regularly maintained</p>
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

                {/* Right Column: Booking Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
                        <div className="mb-6">
                            <span className="text-sm text-gray-500">Daily Rate</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-[#5fcf86]">{formatPrice(car.price)}</span>
                                <span className="text-sm text-gray-400">/ day</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Customer Info */}
                        <div className="mb-4 rounded-lg bg-blue-50 p-3">
                            {isAuthenticated && user ? (
                                <>
                                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Book as</p>
                                    <p className="font-medium text-gray-900">{user.fullName}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
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

                        {/* Date Picker */}
                        <div className="mb-6 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Pick-up Date</label>
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                                    <Calendar size={18} className="text-gray-400" />
                                    <input
                                        type="date"
                                        value={pickupDate}
                                        onChange={(e) => {
                                            setPickupDate(e.target.value);
                                            setError('');
                                        }}
                                        min={today}
                                        className="w-full bg-transparent text-sm outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Return Date</label>
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                                    <Calendar size={18} className="text-gray-400" />
                                    <input
                                        type="date"
                                        value={dropoffDate}
                                        onChange={(e) => {
                                            setDropoffDate(e.target.value);
                                            setError('');
                                        }}
                                        min={pickupDate || today}
                                        className="w-full bg-transparent text-sm outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-6 space-y-3 border-t border-gray-100 pt-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rental Fee ({rentalDays} days)</span>
                                <span className="font-medium text-gray-900">{formatPrice(rentalFee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Insurance</span>
                                <span className="font-medium text-gray-900">{formatPrice(insuranceFee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Service Fee</span>
                                <span className="font-medium text-gray-900">{formatPrice(serviceFee)}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-base font-bold">
                                <span>Total</span>
                                <span className="text-[#5fcf86]">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        {/* Book Now Button */}
                        <button
                            onClick={handleBookNow}
                            disabled={bookingLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5fcf86] py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#4bc076] hover:shadow-[#5fcf86]/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {bookingLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    {isAuthenticated ? 'Book Now' : 'Login to Book'}
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
        </div>
    );
};

export default CarDetailPage;
