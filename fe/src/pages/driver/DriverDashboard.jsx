import { useEffect, useMemo, useState } from 'react';
import {
    Car,
    CheckCircle,
    Clock,
    Loader2,
    MapPin,
    Phone,
    Play,
    RefreshCw,
    Search,
    User,
    Wallet,
    XCircle
} from 'lucide-react';
import driverService from '../../services/driverService';
import Pagination from '../../components/common/Pagination';

const PAGE_SIZE = 6;

const STATUS_LABELS = {
    ASSIGNED: 'Assigned',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In Progress',
    ONGOING: 'Ongoing',
    RETURN_PENDING_PAYMENT: 'Return Pending Payment',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

const STATUS_CLASSES = {
    ASSIGNED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-green-100 text-green-700 border-green-200',
    ONGOING: 'bg-green-100 text-green-700 border-green-200',
    RETURN_PENDING_PAYMENT: 'bg-amber-100 text-amber-700 border-amber-200',
    COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200'
};

const formatPrice = (amount) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
}).format(amount || 0);

const DriverDashboard = () => {
    const [stats, setStats] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        if (!showLoader) setRefreshing(true);
        setError('');
        try {
            const [statsData, tripsData] = await Promise.all([
                driverService.getDriverStats(),
                driverService.getMyTrips()
            ]);
            setStats(statsData || {});
            setTrips(Array.isArray(tripsData) ? tripsData : []);
        } catch (fetchError) {
            console.error('Error fetching driver data:', fetchError);
            setError(fetchError?.response?.data?.message || 'Failed to load driver data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData(true);
    }, []);

    const executeAction = async (tripId, action, confirmText) => {
        if (confirmText && !window.confirm(confirmText)) return;
        setActionLoading(tripId);
        try {
            await action(tripId);
            await fetchData(false);
        } catch (actionError) {
            console.error('Trip action failed:', actionError);
            alert(actionError?.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredTrips = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const base = filter === 'ALL'
            ? trips
            : trips.filter((trip) => trip.status === filter);
        return base
            .filter((trip) => {
                if (!term) return true;
                return trip.bookingCode?.toLowerCase().includes(term)
                    || trip.customerName?.toLowerCase().includes(term)
                    || trip.vehicleName?.toLowerCase().includes(term)
                    || trip.vehiclePlate?.toLowerCase().includes(term);
            })
            .sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
    }, [filter, searchTerm, trips]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm, trips]);

    const totalPages = Math.max(1, Math.ceil(filteredTrips.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedTrips = filteredTrips.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const statusTabs = ['ALL', 'ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'ONGOING', 'RETURN_PENDING_PAYMENT', 'COMPLETED'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-8">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold mb-1">Driver Dashboard</h1>
                    <p className="text-white/90">Manage your assigned trips and earnings</p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-6">
                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                <p className="text-sm md:text-base font-bold text-gray-900">{formatPrice(stats?.totalEarnings)}</p>
                                <p className="text-xs text-gray-500">Total Earnings</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex gap-2 overflow-x-auto">
                            {statusTabs.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${filter === status
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'ALL' ? 'All' : STATUS_LABELS[status] || status}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <div className="relative w-full lg:w-80">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search code, customer, vehicle..."
                                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => fetchData(false)}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary disabled:opacity-60"
                            >
                                {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {paginatedTrips.length > 0 ? (
                        paginatedTrips.map((trip) => (
                            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-mono text-sm text-primary font-semibold">{trip.bookingCode}</p>
                                        <p className="text-xs text-gray-500">{trip.startDate} {'->'} {trip.endDate}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CLASSES[trip.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                        {STATUS_LABELS[trip.status] || trip.status}
                                    </span>
                                </div>

                                <div className="p-4 space-y-3">
                                    <div className="flex gap-4">
                                        <img
                                            src={trip.vehicleImage || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400'}
                                            alt={trip.vehicleName || 'Vehicle'}
                                            className="h-14 w-14 rounded-lg object-cover bg-gray-100"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{trip.vehicleName || 'Vehicle'} ({trip.vehiclePlate || '-'})</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                <span className="inline-flex items-center gap-1"><User size={12} /> {trip.customerName || '-'}</span>
                                                <span className="inline-flex items-center gap-1"><Phone size={12} /> {trip.customerPhone || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {trip.deliveryAddress && (
                                        <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2">
                                            <MapPin size={15} className="text-blue-600 mt-0.5" />
                                            <p className="text-sm text-gray-700">{trip.deliveryAddress}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                                        <span className="text-sm text-gray-600">Driver Fee</span>
                                        <span className="text-sm font-bold text-green-700">{formatPrice(trip.driverFee)}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                    {trip.status === 'ASSIGNED' && (
                                        <>
                                            <button
                                                onClick={() => executeAction(trip.id, driverService.acceptTrip)}
                                                disabled={actionLoading === trip.id}
                                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                            >
                                                {actionLoading === trip.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => executeAction(trip.id, driverService.declineTrip, 'Decline this trip?')}
                                                disabled={actionLoading === trip.id}
                                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60"
                                            >
                                                <XCircle size={16} />
                                                Decline
                                            </button>
                                        </>
                                    )}

                                    {trip.status === 'CONFIRMED' && (
                                        <div className="flex-1 text-center py-2.5 text-blue-700 text-sm font-semibold">
                                            Waiting pickup handover by staff
                                        </div>
                                    )}

                                    {trip.status === 'IN_PROGRESS' && (
                                        <button
                                            onClick={() => executeAction(trip.id, driverService.startTrip)}
                                            disabled={actionLoading === trip.id}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            {actionLoading === trip.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                                            Start Driving
                                        </button>
                                    )}

                                    {trip.status === 'ONGOING' && (
                                        <div className="flex-1 text-center py-2.5 text-green-700 text-sm font-semibold">
                                            Driving in progress
                                        </div>
                                    )}

                                    {trip.status === 'RETURN_PENDING_PAYMENT' && (
                                        <div className="flex-1 text-center py-2.5 text-amber-700 text-sm font-semibold">
                                            Returned - awaiting final payment
                                        </div>
                                    )}

                                    {trip.status === 'COMPLETED' && (
                                        <div className="flex-1 text-center py-2.5 text-green-700 text-sm font-semibold">
                                            Completed
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

                {filteredTrips.length > 0 && (
                    <Pagination
                        currentPage={safePage}
                        totalPages={totalPages}
                        totalItems={filteredTrips.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
