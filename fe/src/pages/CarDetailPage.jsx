import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Star, MapPin, Zap, Fuel, Gauge, Armchair,
    Calendar, ShieldCheck, CheckCircle2, Share2,
    Heart, ChevronRight, Truck, Loader2, AlertCircle
} from 'lucide-react';

import vehicleService from '../services/vehicleService';
import bookingService, { CURRENT_USER } from '../services/bookingService';

const CarDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
            return 'Please select both pick-up and drop-off dates';
        }
        if (pickupDate < today) {
            return 'Pick-up date cannot be in the past';
        }
        if (dropoffDate <= pickupDate) {
            return 'Drop-off date must be after pick-up date';
        }
        return null;
    };

    // Handle booking submission
    const handleBookNow = async () => {
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
                customerName: CURRENT_USER.name,
                customerEmail: CURRENT_USER.email,
                customerPhone: CURRENT_USER.phone,
                startDate: pickupDate,
                endDate: dropoffDate,
                notes: `Booked via web - ${car.name}`
            };

            const result = await bookingService.createBooking(bookingData);

            // Navigate to success page with booking info
            navigate('/booking-success', {
                state: {
                    booking: result,
                    vehicle: car
                }
            });
        } catch (err) {
            console.error('Booking failed:', err);
            setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!car) return <div className="text-center py-20">Car not found</div>;

    return (
        <div className="container mx-auto px-4 py-8 md:px-6">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <Link to="/" className="hover:text-primary">Home</Link>
                <ChevronRight size={14} />
                <Link to="/vehicles" className="hover:text-primary">Vehicles</Link>
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
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {car.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activeImage === idx ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
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
                            <h1 className="text-3xl font-bold text-secondary">{car.name}</h1>
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
                                <Gauge size={16} className="text-primary" />
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
                        <h3 className="mb-4 text-lg font-bold text-secondary">Vehicle Specifications</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Armchair className="mb-2 text-gray-400" size={24} />
                                <p className="text-xs text-gray-500">Seats</p>
                                <p className="font-semibold text-secondary">{car.seats} Seats</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Truck className="mb-2 text-gray-400" size={24} />
                                <p className="text-xs text-gray-500">Transmission</p>
                                <p className="font-semibold text-secondary">{car.transmission}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Zap className="mb-2 text-primary" size={24} />
                                <p className="text-xs text-gray-500">Battery</p>
                                <p className="font-semibold text-secondary">{car.battery}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <Fuel className="mb-2 text-blue-500" size={24} />
                                <p className="text-xs text-gray-500">Charging</p>
                                <p className="font-semibold text-secondary truncate" title={car.charging}>{car.charging}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-secondary">Description</h3>
                        <p className="leading-relaxed text-gray-600">
                            {car.description || `Experience the future of driving with the ${car.name}. This premium electric vehicle offers exceptional range, cutting-edge technology, and sustainable transportation for your journey.`}
                        </p>
                    </div>
                </div>

                {/* Right Column: Booking Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
                        <div className="mb-6">
                            <span className="text-sm text-gray-500">Price per day</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-primary">${car.price}</span>
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

                        {/* Customer Info (Read-only) */}
                        <div className="mb-4 rounded-lg bg-blue-50 p-3">
                            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Booking as</p>
                            <p className="font-medium text-gray-900">{CURRENT_USER.name}</p>
                            <p className="text-sm text-gray-500">{CURRENT_USER.email}</p>
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
                                <label className="text-xs font-bold uppercase text-gray-500">Drop-off Date</label>
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
                                <span className="text-gray-600">Rental Fee ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})</span>
                                <span className="font-medium text-gray-900">${rentalFee}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Insurance</span>
                                <span className="font-medium text-gray-900">${insuranceFee}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Service Fee</span>
                                <span className="font-medium text-gray-900">${serviceFee}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-base font-bold">
                                <span>Total</span>
                                <span className="text-primary">${totalPrice}</span>
                            </div>
                        </div>

                        {/* Book Now Button */}
                        <button
                            onClick={handleBookNow}
                            disabled={bookingLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-hover hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {bookingLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processing...
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
        </div>
    );
};

export default CarDetailPage;
