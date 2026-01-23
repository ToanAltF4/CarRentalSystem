import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight, Loader2, AlertCircle, Search, Filter,
    CheckCircle, Play, RotateCcw, Eye, Calendar
} from 'lucide-react';
import bookingService from '../../services/bookingService';

const AdminBookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [processingId, setProcessingId] = useState(null);

    const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getAll();
            setBookings(data);
            setFilteredBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        let result = bookings;

        // Filter by status
        if (statusFilter !== 'ALL') {
            result = result.filter(b => b.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.bookingCode.toLowerCase().includes(term) ||
                b.customerName.toLowerCase().includes(term) ||
                b.customerEmail.toLowerCase().includes(term) ||
                b.vehicleName.toLowerCase().includes(term)
            );
        }

        setFilteredBookings(result);
    }, [searchTerm, statusFilter, bookings]);

    const handleStatusUpdate = async (id, newStatus) => {
        setProcessingId(id);
        try {
            await bookingService.updateStatus(id, newStatus);
            await fetchBookings();
        } catch (err) {
            console.error('Failed to update status:', err);
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
            IN_PROGRESS: 'bg-green-100 text-green-700 border-green-200',
            COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200'
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const getActions = (booking) => {
        if (processingId === booking.id) {
            return <Loader2 size={16} className="animate-spin text-gray-400" />;
        }

        switch (booking.status) {
            case 'PENDING':
                return (
                    <button
                        onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                    >
                        <CheckCircle size={14} />
                        Approve
                    </button>
                );
            case 'CONFIRMED':
                return (
                    <button
                        onClick={() => handleStatusUpdate(booking.id, 'IN_PROGRESS')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
                    >
                        <Play size={14} />
                        Pickup
                    </button>
                );
            case 'IN_PROGRESS':
                return (
                    <Link
                        to={`/admin/bookings/${booking.id}/return`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors"
                    >
                        <RotateCcw size={14} />
                        Return
                    </Link>
                );
            default:
                return (
                    <Link
                        to={`/vehicles/${booking.vehicleId}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                        <Eye size={14} />
                        View
                    </Link>
                );
        }
    };

    // Count by status
    const statusCounts = bookings.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
    }, {});

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
                    <Link to="/admin/dashboard" className="hover:text-primary">Admin</Link>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">Bookings</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
                        <p className="text-gray-500 mt-1">Review and manage all customer bookings</p>
                    </div>
                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-hover transition-colors"
                    >
                        <Calendar size={18} />
                        Dashboard
                    </Link>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {statusOptions.slice(1).map(status => (
                    <div
                        key={status}
                        onClick={() => setStatusFilter(status === statusFilter ? 'ALL' : status)}
                        className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${statusFilter === status ? 'border-primary shadow-md' : 'border-gray-100 hover:border-gray-200'
                            }`}
                    >
                        <p className="text-2xl font-bold text-gray-900">{statusCounts[status] || 0}</p>
                        <p className="text-sm text-gray-500">{status.replace('_', ' ')}</p>
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 p-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by code, customer, or vehicle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status === 'ALL' ? 'All Status' : status.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Booking</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-semibold text-gray-900">{booking.bookingCode}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{booking.customerName}</p>
                                            <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={booking.vehicleImage || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=60'}
                                                    alt={booking.vehicleName}
                                                    className="w-12 h-8 rounded object-cover"
                                                />
                                                <span className="text-sm text-gray-700">{booking.vehicleName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{booking.startDate}</p>
                                            <p className="text-xs text-gray-500">to {booking.endDate}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900">${booking.totalAmount}</span>
                                            <p className="text-xs text-gray-500">{booking.totalDays} days</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getActions(booking)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingList;
