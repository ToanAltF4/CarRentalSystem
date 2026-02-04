import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Users, FileCheck,
    ChevronRight, Loader2, ArrowUpRight
} from 'lucide-react';
import operatorService from '../../services/operatorService';
import { useAuth } from '../../context/AuthContext';

const OperatorDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await operatorService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Fallback stats for demo if backend not ready
            setStats({
                pendingBookings: 3,
                todayBookings: 0,
                pendingLicenses: 2,
                availableDrivers: 0,
                availableStaff: 3
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">


            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Operator Portal</h1>
                    <p className="text-gray-500">Welcome back, here's what's happening today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Pending Bookings */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                                <Calendar size={24} />
                            </div>
                            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <ArrowUpRight size={12} className="mr-1" /> Live
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.pendingBookings || 0}</h3>
                        <p className="text-gray-500 text-sm">Pending Bookings</p>
                        <Link
                            to="/operator/bookings?status=PENDING"
                            className="inline-flex items-center text-sm text-blue-600 font-medium mt-4 hover:underline"
                        >
                            View details <ChevronRight size={16} />
                        </Link>
                    </div>

                    {/* Today's Operations */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <LayoutDashboard size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.todayBookings || 0}</h3>
                        <p className="text-gray-500 text-sm">Operations Today</p>
                        <Link
                            to="/operator/bookings?filter=today"
                            className="inline-flex items-center text-sm text-blue-600 font-medium mt-4 hover:underline"
                        >
                            View schedule <ChevronRight size={16} />
                        </Link>
                    </div>

                    {/* License Verification */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                <FileCheck size={24} />
                            </div>
                            {stats?.pendingLicenses > 0 && (
                                <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">
                                    Action needed
                                </span>
                            )}
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.pendingLicenses || 0}</h3>
                        <p className="text-gray-500 text-sm">Pending Licenses</p>
                        <Link
                            to="/operator/licenses"
                            className="inline-flex items-center text-sm text-blue-600 font-medium mt-4 hover:underline"
                        >
                            Review now <ChevronRight size={16} />
                        </Link>
                    </div>

                    {/* Staff & Drivers */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                {stats?.availableDrivers || 0}
                            </h3>
                            <span className="text-sm text-gray-400">/ {stats?.availableStaff || 0}</span>
                        </div>
                        <p className="text-gray-500 text-sm">Available Drivers / Staff</p>
                        <Link
                            to="/operator/bookings?status=CONFIRMED"
                            className="inline-flex items-center text-sm text-blue-600 font-medium mt-4 hover:underline"
                        >
                            Assign tasks <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/operator/bookings"
                        className="flex items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Manage Bookings</h4>
                            <p className="text-xs text-gray-500">Approve, reject, or modify bookings</p>
                        </div>
                    </Link>

                    <Link
                        to="/operator/licenses"
                        className="flex items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mr-4">
                            <FileCheck size={20} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Verify Licenses</h4>
                            <p className="text-xs text-gray-500">Review pending driver documents</p>
                        </div>
                    </Link>

                    <Link to="/operator/staff-schedule" className="flex items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
                            <Users size={20} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Staff Schedule</h4>
                            <p className="text-xs text-gray-500">View staff workload and assignments</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;
