import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Users, Calendar, User, Loader2,
    CheckCircle, Clock, ChevronDown, ChevronUp, Car
} from 'lucide-react';
import operatorService from '../../services/operatorService';

const StaffSchedule = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedStaffId, setExpandedStaffId] = useState(null);
    const [staffBookings, setStaffBookings] = useState({});
    const [loadingBookings, setLoadingBookings] = useState(false);

    useEffect(() => {
        fetchStaffSchedule();
    }, []);

    const fetchStaffSchedule = async () => {
        setLoading(true);
        try {
            const staff = await operatorService.getAvailableStaff();
            setStaffList(staff);
        } catch (err) {
            console.error('Failed to fetch staff schedule:', err);
            setError('Failed to load staff schedule');
        } finally {
            setLoading(false);
        }
    };

    const toggleStaffDetails = async (staffId) => {
        if (expandedStaffId === staffId) {
            setExpandedStaffId(null);
            return;
        }

        setExpandedStaffId(staffId);

        // Fetch bookings if not already loaded
        if (!staffBookings[staffId]) {
            setLoadingBookings(true);
            try {
                const bookings = await operatorService.getStaffAssignedBookings(staffId);
                setStaffBookings(prev => ({ ...prev, [staffId]: bookings }));
            } catch (err) {
                console.error('Failed to fetch staff bookings:', err);
            } finally {
                setLoadingBookings(false);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchStaffSchedule}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/operator"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Staff Schedule</h1>
                        <p className="text-gray-500">View staff workload and assigned bookings</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{staffList.length}</p>
                                <p className="text-sm text-gray-500">Total Staff</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {staffList.filter(s => s.currentAssignments === 0).length}
                                </p>
                                <p className="text-sm text-gray-500">Available</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {staffList.filter(s => s.currentAssignments > 0).length}
                                </p>
                                <p className="text-sm text-gray-500">Currently Assigned</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Staff Members</h2>
                        <p className="text-sm text-gray-500">Click on a staff member to view their assigned bookings</p>
                    </div>

                    {staffList.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No staff members found
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {staffList.map((staff) => (
                                <div key={staff.id}>
                                    {/* Staff Row */}
                                    <div
                                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => toggleStaffDetails(staff.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <User size={24} className="text-gray-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{staff.fullName}</h3>
                                                    <p className="text-sm text-gray-500">{staff.role || 'Staff'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Status badge */}
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${staff.currentAssignments === 0
                                                        ? 'bg-green-100 text-green-700'
                                                        : staff.currentAssignments > 3
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {staff.currentAssignments} Tasks
                                                </span>

                                                {/* Expand/collapse icon */}
                                                {expandedStaffId === staff.id ? (
                                                    <ChevronUp size={20} className="text-gray-400" />
                                                ) : (
                                                    <ChevronDown size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Booking Details */}
                                    {expandedStaffId === staff.id && (
                                        <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
                                            {loadingBookings ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <Loader2 className="animate-spin text-blue-600" size={24} />
                                                    <span className="ml-2 text-gray-500">Loading bookings...</span>
                                                </div>
                                            ) : staffBookings[staff.id]?.length > 0 ? (
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                        Assigned Bookings ({staffBookings[staff.id].length})
                                                    </h4>
                                                    {staffBookings[staff.id].map((booking) => (
                                                        <div
                                                            key={booking.id}
                                                            className="bg-white rounded-lg border border-gray-200 p-4"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Car size={16} className="text-blue-600" />
                                                                    <span className="font-medium text-gray-900">
                                                                        {booking.bookingCode}
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded text-xs ${booking.status === 'CONFIRMED'
                                                                            ? 'bg-blue-100 text-blue-700'
                                                                            : booking.status === 'IN_PROGRESS'
                                                                                ? 'bg-green-100 text-green-700'
                                                                                : 'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {booking.status}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-gray-500">Vehicle</p>
                                                                    <p className="font-medium text-gray-900">
                                                                        {booking.vehicleName || 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Customer</p>
                                                                    <p className="font-medium text-gray-900">
                                                                        {booking.customerName || 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-green-50 rounded p-2">
                                                                    <p className="text-green-600 text-xs">📥 Check-in</p>
                                                                    <p className="font-semibold text-green-700">
                                                                        {formatDate(booking.startDate)}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-red-50 rounded p-2">
                                                                    <p className="text-red-600 text-xs">📤 Check-out</p>
                                                                    <p className="font-semibold text-red-700">
                                                                        {formatDate(booking.endDate)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    No bookings assigned to this staff member
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffSchedule;
