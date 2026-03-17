import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar, Car, Clock, DollarSign, XCircle,
    Loader2, AlertCircle, CreditCard, CheckCircle,
    ChevronRight, Eye, Timer, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useListViewState from '../hooks/useListViewState';
import bookingService from '../services/bookingService';
import PaymentModal from '../components/common/PaymentModal';
import Pagination from '../components/common/Pagination';
import { formatPrice } from '../utils/formatters';
import paymentService from '../services/paymentService';
import { peekCachedGet } from '../services/requestCache';
import {
    formatRemainingPaymentTime,
    getPaymentTimeoutMinutes,
    getRemainingPaymentMs
} from '../utils/bookingPaymentTimeout';

const LIST_STATE_KEY = 'my-bookings-page';
const LIST_STATE_TTL_MS = 10 * 60 * 1000;

const MyBookingsPage = () => {
    const PAGE_SIZE = 6;
    const { user } = useAuth();
    const bookingCacheKey = user?.email ? `bookings:by-email:${user.email}` : null;
    const cachedBookings = bookingCacheKey ? peekCachedGet(bookingCacheKey) : undefined;

    const [bookings, setBookings] = useState(() =>
        Array.isArray(cachedBookings) ? cachedBookings : []
    );
    const [loading, setLoading] = useState(!Array.isArray(cachedBookings));
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const [paymentBooking, setPaymentBooking] = useState(null);
    const [returnPayingId, setReturnPayingId] = useState(null);

    const { state: listViewState, setState: setListViewState } = useListViewState({
        cacheKey: LIST_STATE_KEY,
        ttlMs: LIST_STATE_TTL_MS,
        initialState: {
            activeStatus: 'ALL',
            currentPage: 1,
        },
    });

    const activeStatus = listViewState.activeStatus;
    const currentPage = listViewState.currentPage;
    const [now, setNow] = useState(Date.now());
    const timeoutMinutes = getPaymentTimeoutMinutes();

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchBookings = useCallback(async (showLoader = true) => {
        if (showLoader) {
            setLoading(true);
        }
        setError('');
        try {
            if (user?.email) {
                const data = await bookingService.getByEmail(user.email);
                setBookings(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError('Failed to load your bookings');
        } finally {
            setLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        if (!user?.email) {
            setBookings([]);
            setLoading(false);
            return;
        }

        const warmCache = peekCachedGet(`bookings:by-email:${user.email}`);
        if (warmCache !== undefined) {
            setBookings(Array.isArray(warmCache) ? warmCache : []);
            setLoading(false);
            return;
        }

        fetchBookings(true);
    }, [fetchBookings, user?.email]);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        setCancellingId(id);
        try {
            await bookingService.cancel(id);
            await fetchBookings(false);
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            alert(err.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancellingId(null);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentBooking(null);
        fetchBookings(false);
    };

    const getVehicleDisplayName = (booking) => {
        const brand = (booking?.vehicleBrand || '').trim();
        const name = (booking?.vehicleName || '').trim();
        const model = (booking?.vehicleModel || '').trim();
        const baseName = `${brand} ${name}`.trim() || name || model || 'Vehicle';
        const hasModelInBase = model && baseName.toLowerCase().includes(model.toLowerCase());
        return model && !hasModelInBase ? `${baseName} - ${model}` : baseName;
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            CONFIRMED: 'bg-blue-100 text-blue-700',
            IN_PROGRESS: 'bg-green-100 text-green-700',
            RETURN_PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
            COMPLETED: 'bg-gray-100 text-gray-700',
            CANCELLED: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const statusFilters = useMemo(() => {
        const counts = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {});
        return [
            { key: 'ALL', label: 'All', count: bookings.length },
            { key: 'PENDING', label: 'Pending', count: counts.PENDING || 0 },
            { key: 'CONFIRMED', label: 'Confirmed', count: counts.CONFIRMED || 0 },
            { key: 'IN_PROGRESS', label: 'In Progress', count: counts.IN_PROGRESS || 0 },
            { key: 'RETURN_PENDING_PAYMENT', label: 'Final Payment', count: counts.RETURN_PENDING_PAYMENT || 0 },
            { key: 'COMPLETED', label: 'Completed', count: counts.COMPLETED || 0 },
            { key: 'CANCELLED', label: 'Cancelled', count: counts.CANCELLED || 0 }
        ];
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        const list = activeStatus === 'ALL'
            ? bookings
            : bookings.filter((booking) => booking.status === activeStatus);
        return [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }, [activeStatus, bookings]);

    const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedBookings = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredBookings.slice(start, start + PAGE_SIZE);
    }, [filteredBookings, safePage]);

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
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <ChevronRight size={14} />
                        <span className="font-medium text-gray-900">My Bookings</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.fullName || 'Guest'}!</p>
                </div>
                <button
                    onClick={() => fetchBookings(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary transition-colors"
                >
                    <RefreshCw size={16} />
                    Refresh List
                </button>
            </div>

            {/* Filters */}
            {bookings.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() =>
                                setListViewState((prev) => ({
                                    ...prev,
                                    activeStatus: filter.key,
                                    currentPage: 1,
                                }))
                            }
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeStatus === filter.key
                                ? 'bg-primary text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-primary/40'
                                }`}
                        >
                            {filter.label}
                            <span className={`rounded-full px-2 py-0.5 text-xs ${activeStatus === filter.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {filter.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {filteredBookings.length === 0 ? (
                <div className="text-center py-20">
                    <Car className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        {bookings.length === 0 ? 'No bookings yet' : 'No bookings in this status'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {bookings.length === 0
                            ? 'Start by browsing our electric vehicle collection'
                            : 'Try another status filter to see more bookings'}
                    </p>
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
                    {paginatedBookings.map((booking) => {
                        const displayedRemainingMs = booking.status === 'PENDING'
                            ? getRemainingPaymentMs(booking, now)
                            : null;
                        const isExpiredPending = booking.status === 'PENDING'
                            && displayedRemainingMs != null
                            && displayedRemainingMs <= 0;
                        return (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                            <div className="flex flex-col md:flex-row">
                                {/* Vehicle Image */}
                                <div className="md:w-48 h-40 md:h-auto flex-shrink-0">
                                    <img
                                        src={booking.vehicleImage || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400'}
                                        alt={getVehicleDisplayName(booking)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{getVehicleDisplayName(booking)}</h3>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Plate: <span className="font-mono font-semibold">{booking.vehicleLicensePlate || '-'}</span>
                                            </p>
                                            <p className="text-sm text-gray-500 mb-4">Booking Code: <span className="font-mono font-semibold">{booking.bookingCode}</span></p>
                                            {booking.status === 'PENDING' && (
                                                <div className={`mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isExpiredPending ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    <Timer size={16} />
                                                    {displayedRemainingMs == null
                                                        ? `Auto-cancel in ${timeoutMinutes} minutes if unpaid`
                                                        : isExpiredPending
                                                            ? 'Payment window expired - booking will be auto-cancelled'
                                                            : `Auto-cancel in ${formatRemainingPaymentTime(displayedRemainingMs)}`}
                                                </div>
                                            )}

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
                                {(booking.status === 'RETURN_PENDING_PAYMENT' || booking.status === 'COMPLETED') ? (
                                    <>
                                        <p className="text-xs text-gray-400">Final Invoice</p>
                                        <p className="font-semibold text-primary">
                                            {booking.finalInvoiceTotal != null
                                                ? formatPrice(booking.finalInvoiceTotal)
                                                : '—'}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-gray-400">Total</p>
                                        <p className="font-semibold text-primary">{formatPrice(booking.totalAmount)}</p>
                                    </>
                                )}
                            </div>
                        </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 md:items-end md:min-w-[200px]">
                                            {/* Pay Now button - Only for PENDING bookings */}
                                            {booking.status === 'PENDING' && (
                                                <button
                                                    onClick={() => setPaymentBooking(booking)}
                                                    disabled={isExpiredPending}
                                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CreditCard size={16} />
                                                    {isExpiredPending ? 'Payment Expired' : 'Pay Now'}
                                                </button>
                                            )}

                                            <Link
                                                to={booking.bookingCode
                                                    ? `/my-bookings/${encodeURIComponent(booking.bookingCode)}`
                                                    : '/my-bookings'}
                                                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </Link>

                                            {/* Cancel button for PENDING or CONFIRMED bookings */}
                                            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    disabled={cancellingId === booking.id}
                                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    {cancellingId === booking.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <XCircle size={16} />
                                                    )}
                                                    Cancel Booking
                                                </button>
                                            )}

                                            {booking.status === 'IN_PROGRESS' && (
                                                <div className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700">
                                                    <CheckCircle size={16} />
                                                    In Progress
                                                </div>
                                            )}

                                            {booking.status === 'RETURN_PENDING_PAYMENT' && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            setReturnPayingId(booking.id);
                                                            const details = await bookingService.getReturnDetails(booking.id);
                                                            if (details?.invoiceId) {
                                                                const result = await paymentService.createVnpayInvoicePayment(details.invoiceId);
                                                                if (result?.paymentUrl) {
                                                                    window.location.href = result.paymentUrl;
                                                                }
                                                            } else {
                                                                alert('Invoice not found for this booking');
                                                            }
                                                        } catch (err) {
                                                            console.error('Payment error:', err);
                                                            alert(err.response?.data?.message || 'Failed to create payment');
                                                        } finally {
                                                            setReturnPayingId(null);
                                                        }
                                                    }}
                                                    disabled={returnPayingId === booking.id}
                                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors font-semibold disabled:opacity-70"
                                                >
                                                    {returnPayingId === booking.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <CreditCard size={16} />
                                                    )}
                                                    {returnPayingId === booking.id
                                                        ? 'Redirecting to VNPay...'
                                                        : `Pay ${booking.finalInvoiceTotal != null ? formatPrice(booking.finalInvoiceTotal) : 'Final Invoice'}`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredBookings.length > 0 && (
                <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={filteredBookings.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={(page) =>
                        setListViewState((prev) => ({
                            ...prev,
                            currentPage: page,
                        }))
                    }
                />
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



