import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    Loader2,
    RefreshCw,
    Search,
    Truck,
    User
} from 'lucide-react';
import staffService from '../../services/staffService';

const STATUS_CLASS = {
    ASSIGNED: 'bg-indigo-100 text-indigo-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-green-100 text-green-700',
    ONGOING: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700'
};

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pickup');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTasks = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        if (!showLoader) setRefreshing(true);
        setError('');
        try {
            const data = await staffService.getMyTasks();
            setTasks(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            console.error('Error fetching staff tasks:', fetchError);
            setError(fetchError?.response?.data?.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTasks(true);
    }, []);

    const pickupTasks = useMemo(
        () => tasks.filter((task) => task.status === 'ASSIGNED' || task.status === 'CONFIRMED'),
        [tasks]
    );
    const returnTasks = useMemo(
        () => tasks.filter((task) => task.status === 'IN_PROGRESS' || task.status === 'ONGOING'),
        [tasks]
    );

    const filteredTasks = useMemo(() => {
        const source = activeTab === 'pickup' ? pickupTasks : returnTasks;
        const term = searchTerm.trim().toLowerCase();
        if (!term) return source;
        return source.filter((task) =>
            task.bookingCode?.toLowerCase().includes(term)
            || task.customerName?.toLowerCase().includes(term)
            || task.vehicleName?.toLowerCase().includes(term)
            || task.vehicleLicensePlate?.toLowerCase().includes(term)
        );
    }, [activeTab, pickupTasks, returnTasks, searchTerm]);

    const startInspection = (bookingId) => {
        const type = activeTab === 'pickup' ? 'PICKUP' : 'RETURN';
        navigate(`/staff/inspection/${bookingId}?type=${type}`);
    };

    const statCards = [
        { label: 'Total Tasks', value: tasks.length, icon: Clock },
        { label: 'Pending Pickup', value: pickupTasks.length, icon: Truck },
        { label: 'Pending Return', value: returnTasks.length, icon: CheckCircle }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Staff Portal</h1>
                        <p className="text-gray-500">Handle vehicle handover and return inspections.</p>
                    </div>
                    <button
                        onClick={() => fetchTasks(false)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary disabled:opacity-60"
                    >
                        {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Refresh
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {statCards.map((item) => (
                        <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <item.icon size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900">{item.value}</p>
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                            <button
                                onClick={() => setActiveTab('pickup')}
                                className={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === 'pickup'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Pickup ({pickupTasks.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('return')}
                                className={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === 'return'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Return ({returnTasks.length})
                            </button>
                        </div>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search booking code, customer, vehicle..."
                                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-500">
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Loading tasks...
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 border-dashed bg-white py-16 text-center">
                        <Clock className="mx-auto mb-3 text-gray-300" size={36} />
                        <p className="font-medium text-gray-800">No tasks found</p>
                        <p className="text-sm text-gray-500">No pending {activeTab} tasks match your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTasks
                            .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0))
                            .map((task) => (
                                <div key={task.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex gap-4">
                                            <img
                                                src={task.vehicleImage || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=500'}
                                                alt={task.vehicleName}
                                                className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-gray-900">{task.vehicleName || 'Vehicle'}</p>
                                                    <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                        {task.bookingCode}
                                                    </span>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[task.status] || 'bg-gray-100 text-gray-700'}`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-500">
                                                    Plate: {task.vehicleLicensePlate || '-'}
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {activeTab === 'pickup' ? task.startDate : task.endDate}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <User size={14} />
                                                        {task.customerName || task.customerEmail || 'Customer'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => startInspection(task.id)}
                                            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${activeTab === 'pickup'
                                                ? 'bg-orange-600 hover:bg-orange-700'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                        >
                                            {activeTab === 'pickup' ? 'Start Pickup' : 'Start Return'}
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
