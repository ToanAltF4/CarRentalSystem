import { useState, useEffect } from 'react';
import {
    CheckCircle, Clock, Truck,
    Calendar, MapPin, User, ArrowRight
} from 'lucide-react';
import staffService from '../../services/staffService';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pickup'); // pickup, return
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await staffService.getMyTasks();
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter tasks
    // Pickup: Status CONFIRMED
    const pickupTasks = tasks.filter(t => t.status === 'CONFIRMED');
    // Return: Status IN_PROGRESS
    const returnTasks = tasks.filter(t => t.status === 'IN_PROGRESS');

    const filteredTasks = activeTab === 'pickup' ? pickupTasks : returnTasks;

    const handleStartInspection = (bookingId, type) => {
        navigate(`/staff/inspection/${bookingId}?type=${type}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Staff Portal</h1>
                        <p className="text-gray-500">Manage vehicle handovers and returns</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl p-1 mb-6 inline-flex border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('pickup')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'pickup'
                                ? 'bg-orange-100 text-orange-700'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <Truck size={16} /> Pending Pickup ({pickupTasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('return')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'return'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <CheckCircle size={16} /> Pending Return ({returnTasks.length})
                    </button>
                </div>

                {/* Task List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading tasks...</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 border-dashed py-16 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Clock className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                        <p className="text-gray-500">You have no pending {activeTab} tasks.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTasks.map(task => (
                            <div key={task.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {task.vehicleImageUrl ? (
                                                <img src={task.vehicleImageUrl} alt={task.vehicleName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full"><Truck className="text-gray-400" /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{task.vehicleName}</span>
                                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                                                    {task.bookingCode}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {activeTab === 'pickup' ? task.startDate : task.endDate}
                                                </span>
                                                {task.pickupLocation && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} /> {task.pickupLocation}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-gray-700">{task.customerName}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-500">{task.customerEmail}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleStartInspection(task.id, activeTab === 'pickup' ? 'PICKUP' : 'RETURN')}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'pickup'
                                                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                                            } shadow-lg shadow-opacity-30`}
                                    >
                                        {activeTab === 'pickup' ? 'Start Handover' : 'Start Return'}
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
