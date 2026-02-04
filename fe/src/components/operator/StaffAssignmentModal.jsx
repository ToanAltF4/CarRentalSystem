import { useState, useEffect } from 'react';
import {
    X, User, Car, Check, Loader2,
    AlertCircle, Phone, Mail
} from 'lucide-react';
import operatorService from '../../services/operatorService';

const StaffAssignmentModal = ({ booking, onClose, onSuccess }) => {
    // ... same logic ...
    const [staffList, setStaffList] = useState([]);
    const [driverList, setDriverList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedStaff, setSelectedStaff] = useState(booking?.assignedStaffId || '');
    const [selectedDriver, setSelectedDriver] = useState(booking?.driverId || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (booking) fetchResources();
    }, [booking]);

    const fetchResources = async () => {
        try {
            const [staff, drivers] = await Promise.all([
                operatorService.getAvailableStaff(),
                operatorService.getAvailableDrivers()
            ]);
            setStaffList(staff);
            setDriverList(drivers);
        } catch (err) {
            console.error('Failed to fetch resources:', err);
            setError('Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await operatorService.assignStaff(
                booking.id,
                selectedStaff || null,
                selectedDriver || null
            );
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Assignment failed:', err);
            setError(err.response?.data?.message || 'Failed to assign staff');
        } finally {
            setSubmitting(false);
        }
    };

    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Assign Staff & Driver</h3>
                        <p className="text-sm text-gray-500">Booking #{booking.bookingCode}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Delivery Staff Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery/Return Staff
                                </label>
                                <div className="space-y-2">
                                    {staffList.map(staff => (
                                        <label
                                            key={staff.id}
                                            className={`
                                                flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                                                ${selectedStaff === staff.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-200'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="staff"
                                                    value={staff.id}
                                                    checked={selectedStaff === staff.id}
                                                    onChange={() => setSelectedStaff(staff.id)}
                                                    className="hidden"
                                                />
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${selectedStaff === staff.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                                            {staff.fullName}
                                                        </span>
                                                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                            Tasks: {staff.currentAssignments}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{staff.role}</div>
                                                </div>
                                            </div>
                                            {selectedStaff === staff.id && (
                                                <Check size={18} className="text-blue-600" />
                                            )}
                                        </label>
                                    ))}
                                    {staffList.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">No staff available</p>
                                    )}
                                </div>
                            </div>

                            {/* Driver Selection (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Driver (Optional)
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    <label
                                        className={`
                                            flex items-center p-3 rounded-xl border cursor-pointer transition-all
                                            ${selectedDriver === ''
                                                ? 'border-gray-300 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="driver"
                                            value=""
                                            checked={selectedDriver === ''}
                                            onChange={() => setSelectedDriver('')}
                                            className="hidden"
                                        />
                                        <span className="text-sm text-gray-600">No driver assigned</span>
                                    </label>

                                    {driverList.map(driver => (
                                        <label
                                            key={driver.id}
                                            className={`
                                                flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                                                ${selectedDriver === driver.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-green-200'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="driver"
                                                    value={driver.id}
                                                    checked={selectedDriver === driver.id}
                                                    onChange={() => setSelectedDriver(driver.id)}
                                                    className="hidden"
                                                />
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                                    <Car size={16} /> {/* Changed SteeringWheel to Car */}
                                                </div>
                                                <div>
                                                    <span className={`block font-medium ${selectedDriver === driver.id ? 'text-green-700' : 'text-gray-900'}`}>
                                                        {driver.fullName}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Tasks: {driver.currentAssignments}</span>
                                                </div>
                                            </div>
                                            {selectedDriver === driver.id && (
                                                <Check size={18} className="text-green-600" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex-1 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        'Confirm Assignment'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffAssignmentModal;
