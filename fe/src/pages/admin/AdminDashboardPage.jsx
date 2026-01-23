import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    DollarSign, Car, Calendar, Clock, Users, TrendingUp,
    ChevronRight, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
                    <AlertCircle size={20} />
                    {error}
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Revenue',
            value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
            icon: DollarSign,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            change: '+12.5%',
            positive: true
        },
        {
            title: 'Total Bookings',
            value: stats?.totalBookings || 0,
            icon: Calendar,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            change: '+8.2%',
            positive: true
        },
        {
            title: 'Active Rentals',
            value: stats?.activeRentals || 0,
            icon: Clock,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            change: 'In Progress',
            positive: null
        },
        {
            title: 'Pending Bookings',
            value: stats?.pendingBookings || 0,
            icon: Users,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50',
            change: 'Needs Review',
            positive: null
        },
        {
            title: 'Available Vehicles',
            value: stats?.availableVehicles || 0,
            icon: Car,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            subtitle: `of ${stats?.totalVehicles || 0} total`,
            positive: null
        }
    ];

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            CONFIRMED: 'bg-blue-100 text-blue-700',
            IN_PROGRESS: 'bg-green-100 text-green-700',
            COMPLETED: 'bg-gray-100 text-gray-700',
            CANCELLED: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 md:px-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">Admin Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of your EV rental business</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`${stat.bgColor} p-3 rounded-xl`}>
                                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            {stat.positive !== null && (
                                <div className={`flex items-center gap-1 text-xs font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                                    {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.change}
                                </div>
                            )}
                            {stat.positive === null && stat.change && (
                                <span className="text-xs text-gray-400">{stat.change}</span>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        {stat.subtitle && <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link
                    to="/admin/bookings"
                    className="bg-gradient-to-r from-primary to-green-500 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow"
                >
                    <Calendar className="h-8 w-8 mb-4" />
                    <h3 className="text-xl font-bold mb-1">Manage Bookings</h3>
                    <p className="text-white/80 text-sm">Review and approve customer bookings</p>
                </Link>
                <Link
                    to="/admin/vehicles"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow"
                >
                    <Car className="h-8 w-8 mb-4" />
                    <h3 className="text-xl font-bold mb-1">Manage Vehicles</h3>
                    <p className="text-white/80 text-sm">Add, edit, or remove vehicles from fleet</p>
                </Link>
                <Link
                    to="/admin/vehicles/add"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow"
                >
                    <TrendingUp className="h-8 w-8 mb-4" />
                    <h3 className="text-xl font-bold mb-1">Add New Vehicle</h3>
                    <p className="text-white/80 text-sm">Expand your EV fleet</p>
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                    <Link to="/admin/bookings" className="text-primary hover:underline text-sm font-medium">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Booking Code</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats?.recentBookings?.length > 0 ? (
                                stats.recentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-sm font-medium">{booking.bookingCode}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.customerName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{booking.vehicleName}</td>
                                        <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{booking.createdAt}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No recent bookings
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
