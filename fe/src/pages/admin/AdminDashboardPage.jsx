import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    DollarSign, Car, Calendar, Clock, Users, TrendingUp,
    ChevronRight, Loader2, AlertCircle, ArrowUpRight,
    CarFront, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all dashboard data in parallel
                const [statsData, revenue] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getMonthlyRevenue()
                ]);

                // Update state
                setStats(statsData);

                // Use recent bookings from stats DTO (optimized backend)
                if (statsData?.recentBookings) {
                    setRecentBookings(statsData.recentBookings);
                } else {
                    setRecentBookings([]);
                }

                setRevenueData(revenue);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                // Set default mock data if API fails
                setStats({
                    totalRevenue: 0,
                    activeBookings: 0,
                    totalVehicles: 0,
                    pendingApprovals: 0,
                    availableVehicles: 0
                });
                setError('Using demo data - API connection failed');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(m => m.revenue)) : 0;

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

            {/* Quick Actions - Management Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Link to="/admin/vehicles" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#5fcf86] hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-[#5fcf86] group-hover:text-white transition-colors text-purple-600">
                        <CarFront size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Fleet Management</h3>
                        <p className="text-xs text-gray-500">Manage vehicles</p>
                    </div>
                </Link>

                <Link to="/admin/bookings" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#5fcf86] hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-[#5fcf86] group-hover:text-white transition-colors text-blue-600">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Bookings</h3>
                        <p className="text-xs text-gray-500">View & manage rentals</p>
                    </div>
                </Link>

                <Link to="/admin/users" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#5fcf86] hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="bg-orange-50 p-3 rounded-lg group-hover:bg-[#5fcf86] group-hover:text-white transition-colors text-orange-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Users</h3>
                        <p className="text-xs text-gray-500">Customers & Staff</p>
                    </div>
                </Link>

                <Link to="/admin/roles" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#5fcf86] hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-[#5fcf86] group-hover:text-white transition-colors text-gray-600">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Roles</h3>
                        <p className="text-xs text-gray-500">Permissions</p>
                    </div>
                </Link>
            </div>

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
                {/* Revenue Chart - UPDATED with Recharts */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Monthly Revenue</h3>
                            <p className="text-sm text-gray-500">Revenue performance over the year</p>
                        </div>
                        <button className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
                            <Calendar size={16} />
                            Currently {new Date().getFullYear()}
                        </button>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="monthName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [formatPrice(value), 'Revenue']}
                                />
                                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                    {revenueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.revenue === maxRevenue ? '#5fcf86' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                        <Link to="/admin/bookings" className="text-sm font-medium text-[#5fcf86] hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking) => (
                                <div key={booking.id} className="flex items-start gap-3 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                    <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
                                        <Car size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between mb-1">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{booking.customerName}</p>
                                            <span className="text-xs text-gray-400">{booking.createdAt}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 truncate">{booking.vehicleName}</p>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No recent bookings found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
