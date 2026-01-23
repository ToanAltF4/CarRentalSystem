import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar, Car, Clock, DollarSign, XCircle,
    Loader2, AlertCircle, CreditCard, CheckCircle,
    ChevronRight, Eye
} from 'lucide-react';
import bookingService, { CURRENT_USER } from '../services/bookingService';
import PaymentModal from '../components/common/PaymentModal';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const [paymentBooking, setPaymentBooking] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError('Failed to load your bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        setCancellingId(id);
        try {
            await bookingService.cancel(id);
            await fetchBookings(); // Refresh list
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            alert(err.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancellingId(null);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentBooking(null);
        fetchBookings(); // Refresh to show updated status
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            CONFIRMED: 'bg-blue-100 text-blue-700',
            IN_PROGRESS: 'bg-green-100 text-green-700',
            COMPLETED: 'bg-gray-100 text-gray-700',
            CANCELLED: 'bg-red-100 text-red-700'
        };
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
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">My Bookings</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-500 mt-1">Welcome back, {CURRENT_USER.name}!</p>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="text-center py-20">
                    <Car className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h2>
                    <p className="text-gray-500 mb-6">Start by browsing our electric vehicle collection</p>
                    <Link
                        to="/vehicles"
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        Browse Vehicles
                        <ChevronRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Vehicle Image */}
                                <div className="md:w-48 h-40 md:h-auto flex-shrink-0">
                                    <img
                                        src={booking.vehicleImage || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400'}
                                        alt={booking.vehicleName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{booking.vehicleName}</h3>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">Booking Code: <span className="font-mono font-semibold">{booking.bookingCode}</span></p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Pick-up</p>
                                                        <p className="font-medium">{booking.startDate}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Drop-off</p>
                                                        <p className="font-medium">{booking.endDate}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Duration</p>
                                                        <p className="font-medium">{booking.totalDays} days</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <DollarSign size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Total</p>
                                                        <p className="font-semibold text-primary">${booking.totalAmount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 md:items-end">
                                            {booking.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    disabled={cancellingId === booking.id}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    {cancellingId === booking.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <XCircle size={16} />
                                                    )}
                                                    Cancel
                                                </button>
                                            )}

                                            {booking.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => setPaymentBooking(booking)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                >
                                                    <CreditCard size={16} />
                                                    Pay Now
                                                </button>
                                            )}

                                            {booking.status === 'IN_PROGRESS' && (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700">
                                                    <CheckCircle size={16} />
                                                    In Progress
                                                </div>
                                            )}

                                            <Link
                                                to={`/vehicles/${booking.vehicleId}`}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye size={16} />
                                                View Vehicle
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            {paymentBooking && (
                <PaymentModal
                    booking={paymentBooking}
                    onClose={() => setPaymentBooking(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default MyBookingsPage;
