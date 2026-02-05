import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    DollarSign, Car, Calendar, Clock, Users, TrendingUp,
    ChevronRight, Loader2, AlertCircle, ArrowUpRight, BarChart3,
    CarFront, CheckCircle, XCircle, Shield
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import bookingService from '../../services/bookingService';
import { formatPrice } from '../../utils/formatters';

/**
 * Admin Dashboard Page
 * B2C Enterprise Dashboard for E-Fleet
 */
const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Mock monthly revenue data for chart
    const monthlyRevenue = [
        { month: 'Jan', revenue: 125000000 },
        { month: 'Feb', revenue: 152000000 },
        { month: 'Mar', revenue: 183000000 },
        { month: 'Apr', revenue: 168000000 },
        { month: 'May', revenue: 215000000 },
        { month: 'Jun', revenue: 240000000 },
        { month: 'Jul', revenue: 285000000 },
        { month: 'Aug', revenue: 262000000 },
        { month: 'Sep', revenue: 238000000 },
        { month: 'Oct', revenue: 275000000 },
        { month: 'Nov', revenue: 310000000 },
        { month: 'Dec', revenue: 350000000 }
    ];

    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch dashboard stats
                const statsData = await dashboardService.getStats();
                setStats(statsData);

                // Fetch recent bookings
                const bookingsData = await bookingService.getAll();
                setRecentBookings(bookingsData.slice(0, 5));
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                // Set default mock data if API fails
                setStats({
                    totalRevenue: 245000000,
                    activeBookings: 12,
                    totalVehicles: 25,
                    pendingApprovals: 5,
                    availableVehicles: 18
                });
                setError('Using demo data - API connection failed');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatPrice(stats?.totalRevenue || 0),
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            change: '+15.3%',
            positive: true
        },
        {
            title: 'Active Rentals',
            value: stats?.activeBookings || stats?.activeRentals || 0,
            icon: Clock,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            change: 'Active',
            positive: null
        },
        {
            title: 'Total Vehicles',
            value: stats?.totalVehicles || 0,
            icon: CarFront,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            subtitle: `${stats?.availableVehicles || 0} vehicles available`,
            positive: null
        },
        {
            title: 'Pending Approval',
            value: stats?.pendingApprovals || stats?.pendingBookings || 0,
            icon: Users,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            change: 'Action Needed',
            positive: null
        }
    ];

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
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {labels[status] || status}
            </span>
        );
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
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-[#5fcf86]">Home</Link>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">Admin Dashboard</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
                        <p className="text-gray-500 mt-1">E-Fleet - Enterprise Electric Fleet Management</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        <p>Last updated</p>
                        <p className="font-medium text-gray-700">{new Date().toLocaleString('en-US')}</p>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-yellow-700">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <div key={idx} className={`bg-white rounded-2xl border ${stat.borderColor} p-6 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`${stat.bgColor} p-3 rounded-xl`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            {stat.positive !== null && (
                                <div className={`flex items-center gap-1 text-xs font-medium ${stat.positive ? 'text-green-600' : 'text-gray-500'}`}>
                                    {stat.positive && <ArrowUpRight size={14} />}
                                    {stat.change}
                                </div>
                            )}
                            {stat.positive === null && stat.change && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{stat.change}</span>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        {stat.subtitle && <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>}
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Monthly Revenue</h2>
                            <p className="text-sm text-gray-500">Year 2024</p>
                        </div>
                        <div className="flex items-center gap-2 text-[#5fcf86]">
                            <BarChart3 size={20} />
                            <span className="font-semibold">{formatPrice(stats?.totalRevenue || 245000000)}</span>
                        </div>
                    </div>
                    {/* Simple Bar Chart */}
                    <div className="flex items-end justify-between gap-2 h-48">
                        {monthlyRevenue.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-[#5fcf86] to-[#4bc076] rounded-t-lg transition-all hover:from-[#4bc076] hover:to-[#3ab066] cursor-pointer"
                                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                    title={formatPrice(item.revenue)}
                                />
                                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link
                            to="/admin/bookings"
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#5fcf86] to-green-500 rounded-xl text-white hover:shadow-lg transition-all"
                        >
                            <Calendar className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">Manage Bookings</p>
                                <p className="text-xs text-white/80">Review & Process</p>
                            </div>
                        </Link>
                        <Link
                            to="/admin/vehicles"
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white hover:shadow-lg transition-all"
                        >
                            <Car className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">Manage Vehicles</p>
                                <p className="text-xs text-white/80">Add, Edit, Delete</p>
                            </div>
                        </Link>
                        <Link
                            to="/admin/users"
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl text-white hover:shadow-lg transition-all"
                        >
                            <Users className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">Manage Users</p>
                                <p className="text-xs text-white/80">Verify Licenses</p>
                            </div>
                        </Link>
                        <Link
                            to="/admin/roles"
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white hover:shadow-lg transition-all"
                        >
                            <Shield className="h-6 w-6" />
                            <div>
                                <p className="font-semibold">Manage Roles</p>
                                <p className="text-xs text-white/80">Add, Edit, Delete</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                    <Link to="/admin/bookings" className="text-[#5fcf86] hover:underline text-sm font-medium flex items-center gap-1">
                        View All <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Booking Code</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentBookings.length > 0 ? (
                                recentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-medium text-[#5fcf86]">{booking.bookingCode}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{booking.customerName}</p>
                                            <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.vehicleName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {booking.startDate} → {booking.endDate}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>No bookings yet</p>
                                        <p className="text-sm">New bookings will appear here</p>
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

export default AdminDashboardPage;
