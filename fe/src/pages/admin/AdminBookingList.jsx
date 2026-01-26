import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight, Loader2, AlertCircle, Search, Filter,
    CheckCircle, XCircle, Car, RefreshCw, Calendar, X,
    Phone, Mail, Clock, DollarSign
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import { formatPrice } from '../../utils/formatters';

/**
 * Admin Booking List Page
 * Full booking management with status filters and actions
 */
const AdminBookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [actionLoading, setActionLoading] = useState(null);

    // Return Modal State
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnBooking, setReturnBooking] = useState(null);
    const [returnCondition, setReturnCondition] = useState('GOOD');
    const [returnNotes, setReturnNotes] = useState('');

    const tabs = [
        { id: 'ALL', label: 'All', count: bookings.length },
        { id: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
        { id: 'CONFIRMED', label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length },
        { id: 'ONGOING', label: 'Ongoing', count: bookings.filter(b => b.status === 'ONGOING' || b.status === 'IN_PROGRESS').length },
        { id: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
        { id: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length }
    ];

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [bookings, activeTab, searchTerm]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getAll();
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        let filtered = [...bookings];

        // Filter by tab
        if (activeTab !== 'ALL') {
            if (activeTab === 'ONGOING') {
                filtered = filtered.filter(b => b.status === 'ONGOING' || b.status === 'IN_PROGRESS');
            } else {
                filtered = filtered.filter(b => b.status === activeTab);
            }
        }

        // Filter by search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(b =>
                b.bookingCode?.toLowerCase().includes(term) ||
                b.customerName?.toLowerCase().includes(term) ||
                b.customerEmail?.toLowerCase().includes(term) ||
                b.vehicleName?.toLowerCase().includes(term)
            );
        }

        setFilteredBookings(filtered);
    };

    // Action Handlers
    const handleApprove = async (booking) => {
        if (!window.confirm(`Confirm approve booking ${booking.bookingCode}?`)) return;
        setActionLoading(booking.id);
        try {
            await bookingService.updateStatus(booking.id, 'CONFIRMED');
            await fetchBookings();
        } catch (err) {
            alert('Failed to approve booking: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (booking) => {
        if (!window.confirm(`Confirm reject booking ${booking.bookingCode}?`)) return;
        setActionLoading(booking.id);
        try {
            await bookingService.cancel(booking.id);
            await fetchBookings();
        } catch (err) {
            alert('Failed to reject booking: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleHandover = async (booking) => {
        if (!window.confirm(`Confirm handover for booking ${booking.bookingCode}?`)) return;
        setActionLoading(booking.id);
        try {
            await bookingService.updateStatus(booking.id, 'IN_PROGRESS');
            await fetchBookings();
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const openReturnModal = (booking) => {
        setReturnBooking(booking);
        setReturnCondition('GOOD');
        setReturnNotes('');
        setShowReturnModal(true);
    };

    const handleReturn = async () => {
        if (!returnBooking) return;
        setActionLoading(returnBooking.id);
        try {
            await bookingService.processReturn(returnBooking.id, {
                condition: returnCondition,
                notes: returnNotes,
                returnOdometerKm: 0,
                fuelLevelPercent: 100
            });
            setShowReturnModal(false);
            await fetchBookings();
        } catch (err) {
            alert('Failed to process return: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
            ONGOING: 'bg-green-100 text-green-700 border-green-200',
            IN_PROGRESS: 'bg-green-100 text-green-700 border-green-200',
            COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200'
        };
        const labels = {
            PENDING: 'Pending',
            CONFIRMED: 'Confirmed',
            ONGOING: 'Ongoing',
            IN_PROGRESS: 'In Progress',
            COMPLETED: 'Completed',
            CANCELLED: 'Cancelled'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const renderActions = (booking) => {
        const isLoading = actionLoading === booking.id;

        if (isLoading) {
            return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />;
        }

        switch (booking.status) {
            case 'PENDING':
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleApprove(booking)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <CheckCircle size={14} />
                            Approve
                        </button>
                        <button
                            onClick={() => handleReject(booking)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <XCircle size={14} />
                            Reject
                        </button>
                    </div>
                );
            case 'CONFIRMED':
                return (
                    <button
                        onClick={() => handleHandover(booking)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Car size={14} />
                        Handover
                    </button>
                );
            case 'ONGOING':
            case 'IN_PROGRESS':
                return (
                    <button
                        onClick={() => openReturnModal(booking)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs font-semibold rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Return
                    </button>
                );
            case 'COMPLETED':
                return <span className="text-xs text-gray-400">Completed</span>;
            case 'CANCELLED':
                return <span className="text-xs text-gray-400">Cancelled</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5fcf86]" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:px-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-[#5fcf86]">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/admin" className="hover:text-[#5fcf86]">Admin</Link>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">Booking Management</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Car Rental Bookings</h1>
                        <p className="text-gray-500 mt-1">Approve, track, and process car rental orders</p>
                    </div>
                    <button
                        onClick={fetchBookings}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by booking code, customer, vehicle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20 outline-none transition-all"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'bg-[#5fcf86] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {tab.label}
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Booking Code</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total Amount</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold text-[#5fcf86]">
                                                {booking.bookingCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{booking.customerName}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <Mail size={12} />
                                                    {booking.customerEmail}
                                                </div>
                                                {booking.customerPhone && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Phone size={12} />
                                                        {booking.customerPhone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{booking.vehicleName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {booking.startDate}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                <Clock size={14} className="text-gray-400" />
                                                {booking.endDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-semibold text-gray-900">
                                                <DollarSign size={14} className="text-green-500" />
                                                {formatPrice(booking.totalPrice || booking.totalAmount || 0)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderActions(booking)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p className="font-medium">No bookings found</p>
                                        <p className="text-sm">Try changing filters or search terms</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && returnBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Process Return</h3>
                            <button onClick={() => setShowReturnModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-500">Booking Code</p>
                                <p className="font-mono font-bold text-[#5fcf86]">{returnBooking.bookingCode}</p>
                                <p className="text-sm text-gray-500 mt-2">Vehicle</p>
                                <p className="font-medium">{returnBooking.vehicleName}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Condition</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setReturnCondition('GOOD')}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${returnCondition === 'GOOD'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                                        <span className="text-sm font-medium">Good</span>
                                    </button>
                                    <button
                                        onClick={() => setReturnCondition('DAMAGED')}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${returnCondition === 'DAMAGED'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                                        <span className="text-sm font-medium">Damaged</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={returnNotes}
                                    onChange={(e) => setReturnNotes(e.target.value)}
                                    placeholder="Enter notes (if any)..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20 outline-none resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowReturnModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturn}
                                disabled={actionLoading === returnBooking.id}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#5fcf86] text-white rounded-xl font-semibold hover:bg-[#4bc076] transition-colors disabled:opacity-70"
                            >
                                {actionLoading === returnBooking.id ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <CheckCircle size={18} />
                                )}
                                Confirm Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookingList;
