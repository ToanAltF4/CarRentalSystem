import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    AlertCircle,
    Calendar,
    Car,
    ChevronRight,
    Clock,
    DollarSign,
    Loader2,
    MapPin,
    User,
    Eye
} from 'lucide-react';
import bookingService from '../services/bookingService';
import { formatPrice } from '../utils/formatters';

const BookingDetailPage = () => {
    const { bookingCode } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingCode) {
                setError('Booking code is missing');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await bookingService.getByCode(decodeURIComponent(bookingCode));
                setBooking(data);
            } catch (err) {
                console.error('Failed to fetch booking details:', err);
                setError('Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingCode]);

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            CONFIRMED: 'bg-blue-100 text-blue-700',
            IN_PROGRESS: 'bg-green-100 text-green-700',
            COMPLETED: 'bg-gray-100 text-gray-700',
            CANCELLED: 'bg-red-100 text-red-700'
        };

        if (!status) return null;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:px-6">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/my-bookings" className="hover:text-primary">My Bookings</Link>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">Booking Details</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {!error && booking && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-72 h-52 md:h-auto flex-shrink-0">
                            <img
                                src={booking.vehicleImage || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800'}
                                alt={booking.vehicleName || 'Vehicle'}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-gray-900">{booking.vehicleName || 'Vehicle'}</h2>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Booking Code: <span className="font-mono font-semibold">{booking.bookingCode}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs text-gray-400 mb-2">Rental Schedule</p>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span>Pick-up: {booking.startDate || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span>Drop-off: {booking.endDate || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            <span>Duration: {booking.totalDays || 0} days</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs text-gray-400 mb-2">Payment Summary</p>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span>Daily Rate: {formatPrice(booking.dailyRate || 0)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span>Total: <span className="font-semibold text-primary">{formatPrice(booking.totalAmount || 0)}</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs text-gray-400 mb-2">Booking Info</p>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Car size={16} className="text-gray-400" />
                                            <span>Rental Type: {booking.rentalTypeName || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span>Pickup Method: {booking.pickupMethodName || '-'}</span>
                                        </div>
                                        {booking.deliveryAddress && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span>Delivery Address: {booking.deliveryAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs text-gray-400 mb-2">Customer Info</p>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <span>Name: {booking.customerName || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <span>Email: {booking.customerEmail || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <span>Phone: {booking.customerPhone || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/my-bookings"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back to My Bookings
                                </Link>
                                {booking.vehicleId && (
                                    <Link
                                        to={`/vehicles/${booking.vehicleId}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Eye size={16} />
                                        View Vehicle
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetailPage;
