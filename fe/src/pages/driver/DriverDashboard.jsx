import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Car, MapPin, Phone, Mail, Calendar, Clock, DollarSign,
    ChevronRight, Loader2, CheckCircle, XCircle, Play,
    User, Wallet, TrendingUp, Navigation
} from 'lucide-react';
import driverService from '../../services/driverService';

/**
 * Driver Dashboard Page
 */
const DriverDashboard = () => {
    const [stats, setStats] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, tripsData] = await Promise.all([
                driverService.getDriverStats(),
                driverService.getMyTrips()
            ]);
            setStats(statsData);
            setTrips(tripsData);
        } catch (err) {
            console.error('Error fetching driver data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (tripId) => {
        setActionLoading(tripId);
        try {
            await driverService.acceptTrip(tripId);
            fetchData();
        } catch (err) {
            alert('Failed to accept trip: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleStart = async (tripId) => {
        setActionLoading(tripId);
        try {
            await driverService.startTrip(tripId);
            fetchData();
        } catch (err) {
            alert('Failed to start trip: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (tripId) => {
        setActionLoading(tripId);
        try {
            await driverService.completeTrip(tripId);
            fetchData();
        } catch (err) {
            alert('Failed to complete trip: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (tripId) => {
        if (!confirm('Are you sure you want to decline this trip?')) return;
        setActionLoading(tripId);
        try {
            await driverService.declineTrip(tripId);
            fetchData();
        } catch (err) {
            alert('Failed to decline trip: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            ASSIGNED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
            IN_PROGRESS: 'bg-green-100 text-green-700 border-green-200',
            ONGOING: 'bg-green-100 text-green-700 border-green-200',
            COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100'}`}>
                {status?.replace('_', ' ')}
            </span>
        );
    };

    const filteredTrips = filter === 'ALL'
        ? trips
        : trips.filter(t => t.status === filter);

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-8">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold mb-2">🚗 Driver Dashboard</h1>
                    <p className="text-white/80">Manage your trips and earnings</p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Car className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalTrips || 0}</p>
                                <p className="text-xs text-gray-500">Total Trips</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.completedTrips || 0}</p>
                                <p className="text-xs text-gray-500">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="text-yellow-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats?.pendingTrips || 0}</p>
                                <p className="text-xs text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Wallet className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">{formatPrice(stats?.totalEarnings)}</p>
                                <p className="text-xs text-gray-500">Earnings</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-6 flex gap-2 overflow-x-auto">
                    {['ALL', 'ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Trips List */}
                <div className="space-y-4">
                    {filteredTrips.length > 0 ? (
                        filteredTrips.map(trip => (
                            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Trip Header */}
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-mono text-sm text-primary font-semibold">{trip.bookingCode}</p>
                                        <p className="text-xs text-gray-500">{trip.startDate} → {trip.endDate}</p>
                                    </div>
                                    {getStatusBadge(trip.status)}
                                </div>

                                {/* Trip Body */}
                                <div className="p-4 space-y-3">
                                    {/* Customer Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User size={20} className="text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{trip.customerName}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {trip.customerPhone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Car size={18} className="text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">{trip.vehicleName}</p>
                                            <p className="text-xs text-gray-500">{trip.vehiclePlate}</p>
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    {trip.deliveryAddress && (
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                            <MapPin size={18} className="text-blue-500 mt-0.5" />
                                            <p className="text-sm text-gray-700">{trip.deliveryAddress}</p>
                                        </div>
                                    )}

                                    {/* Driver Fee */}
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Your Earnings</span>
                                        <span className="font-bold text-green-600">{formatPrice(trip.driverFee)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                    {trip.status === 'ASSIGNED' && (
                                        <>
                                            <button
                                                onClick={() => handleAccept(trip.id)}
                                                disabled={actionLoading === trip.id}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {actionLoading === trip.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleDecline(trip.id)}
                                                disabled={actionLoading === trip.id}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50"
                                            >
                                                <XCircle size={18} />
                                                Decline
                                            </button>
                                        </>
                                    )}
                                    {trip.status === 'CONFIRMED' && (
                                        <button
                                            onClick={() => handleStart(trip.id)}
                                            disabled={actionLoading === trip.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            {actionLoading === trip.id ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                                            Start Trip
                                        </button>
                                    )}
                                    {(trip.status === 'IN_PROGRESS' || trip.status === 'ONGOING') && (
                                        <button
                                            onClick={() => handleComplete(trip.id)}
                                            disabled={actionLoading === trip.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
                                        >
                                            {actionLoading === trip.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                            Complete Trip
                                        </button>
                                    )}
                                    {trip.status === 'COMPLETED' && (
                                        <div className="flex-1 text-center py-2.5 text-green-600 font-medium">
                                            ✓ Trip Completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                            <Car size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No trips found</p>
                            <p className="text-sm text-gray-400">New trips will appear here when assigned</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
