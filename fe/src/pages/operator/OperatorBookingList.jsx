import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Calendar,
    Search,
    UserPlus,
    ChevronDown,
    Loader2,
    CheckCircle2,
    XCircle,
    RefreshCw
} from 'lucide-react';
import operatorService from '../../services/operatorService';
import StaffAssignmentModal from '../../components/operator/StaffAssignmentModal';
import Pagination from '../../components/common/Pagination';

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending Approval' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
];

const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800';
        case 'CONFIRMED':
            return 'bg-blue-100 text-blue-800';
        case 'ASSIGNED':
            return 'bg-indigo-100 text-indigo-800';
        case 'IN_PROGRESS':
            return 'bg-green-100 text-green-800';
        case 'COMPLETED':
            return 'bg-gray-100 text-gray-800';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const isWithDriver = (typeName) => {
    if (!typeName) return false;
    const normalized = typeName.toLowerCase();
    return normalized.includes('driver') || normalized.includes('chauffeur');
};

const isInTodayRange = (booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = booking?.startDate ? new Date(booking.startDate) : null;
    const end = booking?.endDate ? new Date(booking.endDate) : null;
    if (!start || !end) return false;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return start <= today && today <= end;
};

const OperatorBookingList = () => {
    const PAGE_SIZE = 10;
    const [searchParams] = useSearchParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'ALL');
    const [todayOnly, setTodayOnly] = useState(searchParams.get('filter') === 'today');
    const [filterRentalType, setFilterRentalType] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        if (!showLoader) setRefreshing(true);
        setError('');
        try {
            let data;
            if (todayOnly) {
                data = await operatorService.getTodayBookings();
            } else if (filterStatus !== 'ALL') {
                data = await operatorService.getBookingsByStatus(filterStatus);
            } else {
                data = await operatorService.getAllBookings();
            }
            setBookings(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            console.error('Error loading bookings:', fetchError);
            setError(fetchError?.response?.data?.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, todayOnly]);

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this booking?')) return;
        try {
            await operatorService.approveBooking(id);
            await fetchBookings(false);
        } catch (approveError) {
            console.error('Failed to approve booking:', approveError);
            alert(approveError?.response?.data?.message || 'Failed to approve booking');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await operatorService.rejectBooking(id, reason);
            await fetchBookings(false);
        } catch (rejectError) {
            console.error('Failed to reject booking:', rejectError);
            alert(rejectError?.response?.data?.message || 'Failed to reject booking');
        }
    };

    const handleUnassign = async (id) => {
        if (!window.confirm('Remove current assignment from this booking?')) return;
        try {
            await operatorService.unassignStaff(id);
            await fetchBookings(false);
        } catch (unassignError) {
            console.error('Failed to unassign staff/driver:', unassignError);
            alert(unassignError?.response?.data?.message || 'Failed to unassign');
        }
    };

    const handleAssignmentSuccess = async () => {
        await fetchBookings(false);
    };

    const term = searchTerm.trim().toLowerCase();
    const filteredBookings = bookings
        .filter((booking) => {
            const statusMatch = filterStatus === 'ALL' || booking.status === filterStatus;
            const todayMatch = !todayOnly || isInTodayRange(booking);
            const rentalType = isWithDriver(booking.rentalTypeName) ? 'WITH_DRIVER' : 'SELF_DRIVE';
            const rentalMatch = filterRentalType === 'ALL' || rentalType === filterRentalType;
            const searchMatch =
                term.length === 0 ||
                booking.bookingCode?.toLowerCase().includes(term) ||
                booking.customerName?.toLowerCase().includes(term) ||
                booking.customerPhone?.toLowerCase().includes(term) ||
                booking.vehicleName?.toLowerCase().includes(term) ||
                booking.vehicleLicensePlate?.toLowerCase().includes(term);
            return statusMatch && todayMatch && rentalMatch && searchMatch;
        })
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, todayOnly, filterRentalType, searchTerm, bookings]);

    const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedBookings = filteredBookings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
                        <p className="text-gray-500">Approve, reject, and assign staff/driver for operations.</p>
                    </div>
                    <button
                        onClick={() => fetchBookings(false)}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary disabled:opacity-60"
                    >
                        {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Refresh
                    </button>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search code, customer, vehicle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-10 focus:border-primary focus:outline-none"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    <div className="relative">
                        <select
                            value={filterRentalType}
                            onChange={(e) => setFilterRentalType(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-10 focus:border-primary focus:outline-none"
                        >
                            <option value="ALL">All Services</option>
                            <option value="SELF_DRIVE">Self Drive</option>
                            <option value="WITH_DRIVER">With Driver</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                        <input
                            type="checkbox"
                            checked={todayOnly}
                            onChange={(e) => setTodayOnly(e.target.checked)}
                            className="h-4 w-4 accent-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Today only</span>
                    </label>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-3">Booking</th>
                                    <th className="px-6 py-3">Vehicle</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Assignment</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Loading bookings...
                                            </span>
                                        </td>
                                    </tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                            No bookings match current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{booking.bookingCode}</div>
                                                <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                                    <Calendar size={14} />
                                                    {booking.startDate} - {booking.endDate}
                                                </div>
                                                <div className="mt-1 text-xs font-medium text-blue-600">
                                                    {booking.rentalTypeName || 'Standard'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{booking.vehicleName || '-'}</div>
                                                <div className="text-sm text-gray-500">{booking.vehicleLicensePlate || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{booking.customerName || '-'}</div>
                                                <div className="text-sm text-gray-500">{booking.customerPhone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Staff: </span>
                                                        <span className="font-medium text-gray-900">{booking.assignedStaffName || 'Unassigned'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Driver: </span>
                                                        <span className={`font-medium ${booking.driverName ? 'text-gray-900' : isWithDriver(booking.rentalTypeName) ? 'text-red-600' : 'text-gray-900'}`}>
                                                            {booking.driverName || (isWithDriver(booking.rentalTypeName) ? 'Required' : 'N/A')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    {booking.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(booking.id)}
                                                                className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(booking.id)}
                                                                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                                            >
                                                                <XCircle size={14} />
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {(booking.status === 'CONFIRMED' || booking.status === 'ASSIGNED') && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setShowAssignmentModal(true);
                                                            }}
                                                            className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                        >
                                                            <UserPlus size={14} />
                                                            Assign
                                                        </button>
                                                    )}

                                                    {(booking.assignedStaffId || booking.driverId) &&
                                                        (booking.status === 'CONFIRMED' || booking.status === 'ASSIGNED' || booking.status === 'IN_PROGRESS') && (
                                                            <button
                                                                onClick={() => handleUnassign(booking.id)}
                                                                className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Unassign
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

                {filteredBookings.length > 0 && (
                    <div className="px-4 pb-4">
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            totalItems={filteredBookings.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                            className="mt-4 pt-3"
                        />
                    </div>
                )}
            </div>

            {showAssignmentModal && selectedBooking && (
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
