import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Calendar, Search, Filter, CheckCircle, XCircle,
    MoreVertical, UserPlus, Clock, ChevronDown
} from 'lucide-react';
import operatorService from '../../services/operatorService';
import StaffAssignmentModal from '../../components/operator/StaffAssignmentModal';

const OperatorBookingList = () => {
    const [searchParams] = useSearchParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Assignment Modal State
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [filterStatus]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let data;
            if (filterStatus === 'PENDING') {
                data = await operatorService.getPendingBookings();
            } else if (filterStatus === 'TODAY' || searchParams.get('filter') === 'today') {
                data = await operatorService.getTodayBookings();
            } else if (filterStatus === 'CONFIRMED') {
                data = await operatorService.getConfirmedBookings();
            } else {
                const pending = await operatorService.getPendingBookings();
                const confirmed = await operatorService.getConfirmedBookings();
                data = [...pending, ...confirmed];
            }
            setBookings(data);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await operatorService.approveBooking(id);
            fetchBookings(); // Refresh list
        } catch (err) {
            console.error('Failed to approve:', err);
            alert('Failed to approve booking');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            await operatorService.rejectBooking(id, reason);
            fetchBookings();
        } catch (err) {
            console.error('Failed to reject:', err);
            alert('Failed to reject booking');
        }
    };

    const openAssignment = (booking) => {
        setSelectedBooking(booking);
        setShowAssignmentModal(true);
    };

    const handleAssignmentSuccess = () => {
        fetchBookings();
    };

    const filteredBookings = bookings.filter(booking =>
        booking.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-gray-100 text-gray-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
                        <p className="text-gray-500">Track, approve, and assign staff</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search booking..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="ALL">All Bookings</option>
                                <option value="PENDING">Pending Approval</option>
                                <option value="CONFIRMED">Ready for Assignment</option>
                                <option value="TODAY">Today's Operations</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            Loading bookings...
                                        </td>
                                    </tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No bookings found matches your filter
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{booking.bookingCode}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {booking.startDate} - {booking.endDate}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {booking.totalDays} days
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{booking.vehicleName}</div>
                                                <div className="text-sm text-gray-500">{booking.vehicleLicensePlate}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{booking.customerName}</div>
                                                <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {booking.assignedStaffName ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{booking.assignedStaffName}</div>
                                                        <div className="text-xs text-gray-500">Staff</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                                                )}
                                                {booking.driverName && (
                                                    <div className="text-sm mt-1">
                                                        <div className="font-medium text-gray-900">{booking.driverName}</div>
                                                        <div className="text-xs text-gray-500">Driver</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {booking.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(booking.id)}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(booking.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {booking.status === 'CONFIRMED' && (
                                                        <button
                                                            onClick={() => openAssignment(booking)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Assign Staff"
                                                        >
                                                            <UserPlus size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAssignmentModal && (
                <StaffAssignmentModal
                    booking={selectedBooking}
                    onClose={() => setShowAssignmentModal(false)}
                    onSuccess={handleAssignmentSuccess}
                />
            )}
        </div>
    );
};

export default OperatorBookingList;
