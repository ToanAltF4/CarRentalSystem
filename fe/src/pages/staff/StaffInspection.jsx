import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Battery,
    CheckCircle,
    Loader2,
    Save
} from 'lucide-react';
import staffService from '../../services/staffService';

const STATUS_LABELS = {
    ASSIGNED: 'Assigned',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In Progress',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

const StaffInspection = () => {
    const { bookingId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const typeParam = (searchParams.get('type') || 'PICKUP').toUpperCase();
    const isPickup = typeParam === 'PICKUP';
    const isReturn = typeParam === 'RETURN';

    const [booking, setBooking] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        batteryLevel: 100,
        odometer: 0,
        chargingCablePresent: true,
        exteriorCondition: 'GOOD',
        interiorCondition: 'GOOD',
        hasDamage: false,
        damageDescription: '',
        inspectionNotes: ''
    });

    useEffect(() => {
        const load = async () => {
            setLoadingDetail(true);
            setError('');
            try {
                const data = await staffService.getTaskDetail(bookingId);
                setBooking(data);
            } catch (fetchError) {
                console.error('Failed to load task detail:', fetchError);
                setError(fetchError?.response?.data?.message || 'Failed to load booking detail');
            } finally {
                setLoadingDetail(false);
            }
        };
        load();
    }, [bookingId]);

    const headerTitle = useMemo(() => {
        if (isPickup) return 'Vehicle Handover Inspection';
        if (isReturn) return 'Vehicle Return Inspection';
        return 'Inspection';
    }, [isPickup, isReturn]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const batteryLevel = Number(formData.batteryLevel);
        const odometer = Number(formData.odometer);

        if (!isPickup && !isReturn) {
            setError('Invalid inspection type.');
            return;
        }
        if (!Number.isFinite(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
            setError('Battery level must be between 0 and 100.');
            return;
        }
        if (!Number.isFinite(odometer) || odometer < 0) {
            setError('Odometer must be 0 or greater.');
            return;
        }
        if (formData.hasDamage && !formData.damageDescription.trim()) {
            setError('Please provide damage description.');
            return;
        }

        setSubmitting(true);
        try {
            await staffService.submitInspection({
                bookingId: Number(bookingId),
                type: typeParam,
                batteryLevel,
                odometer,
                chargingCablePresent: formData.chargingCablePresent,
                exteriorCondition: formData.exteriorCondition,
                interiorCondition: formData.interiorCondition,
                hasDamage: formData.hasDamage,
                damageDescription: formData.hasDamage ? formData.damageDescription.trim() : '',
                inspectionNotes: formData.inspectionNotes.trim()
            });
            navigate('/staff');
        } catch (submitError) {
            console.error('Inspection submit failed:', submitError);
            setError(submitError?.response?.data?.message || 'Failed to submit inspection');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingDetail) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="container mx-auto max-w-3xl flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/staff')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <h1 className="text-base md:text-lg font-bold text-gray-900">{headerTitle}</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-3xl mt-6 px-4 space-y-5">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {booking && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <img
                                src={booking.vehicleImage || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=500'}
                                alt={booking.vehicleName}
                                className="h-24 w-full sm:w-28 rounded-lg object-cover bg-gray-100"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Booking Code</p>
                                <p className="font-semibold text-gray-900">{booking.bookingCode}</p>
                                <p className="text-gray-700 mt-1">{booking.vehicleName} {booking.vehicleModel ? `- ${booking.vehicleModel}` : ''}</p>
                                <p className="text-sm text-gray-500">Plate: {booking.vehicleLicensePlate || '-'}</p>
                                <p className="text-sm text-gray-500">Customer: {booking.customerName || '-'}</p>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                                {STATUS_LABELS[booking.status] || booking.status}
                            </span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-800">Meter Readings</div>
                        <div className="p-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Odometer (km)</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.odometer}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, odometer: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Battery Level (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        value={formData.batteryLevel}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, batteryLevel: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-10 focus:border-primary focus:outline-none"
                                    />
                                    <Battery size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-800">Condition</div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                                <span className="text-sm font-medium text-gray-700">Charging Cable Present</span>
                                <input
                                    type="checkbox"
                                    checked={formData.chargingCablePresent}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, chargingCablePresent: e.target.checked }))}
                                    className="h-4 w-4 accent-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Exterior Condition</label>
                                    <select
                                        value={formData.exteriorCondition}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, exteriorCondition: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none"
                                    >
                                        <option value="GOOD">Good</option>
                                        <option value="DAMAGED">Damaged</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Interior Condition</label>
                                    <select
                                        value={formData.interiorCondition}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, interiorCondition: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none"
                                    >
                                        <option value="GOOD">Good</option>
                                        <option value="DAMAGED">Damaged</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-800 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Damage Report
                        </div>
                        <div className="p-5 space-y-4">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={formData.hasDamage}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, hasDamage: e.target.checked }))}
                                    className="h-4 w-4 accent-red-600"
                                />
                                Vehicle has damage
                            </label>

                            {formData.hasDamage && (
                                <textarea
                                    rows={4}
                                    value={formData.damageDescription}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, damageDescription: e.target.value }))}
                                    placeholder="Describe the damage details..."
                                    className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 focus:border-red-400 focus:outline-none"
                                />
                            )}

                            <textarea
                                rows={3}
                                value={formData.inspectionNotes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, inspectionNotes: e.target.value }))}
                                placeholder="Inspection notes..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/staff')}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Submit Inspection
                        </button>
                    </div>
                </form>

                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5" />
                    Pickup inspection moves booking to IN_PROGRESS. Return inspection completes the booking.
                </div>
            </div>
        </div>
    );
};

export default StaffInspection;
