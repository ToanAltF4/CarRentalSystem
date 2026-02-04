import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle, AlertTriangle, Battery, Calculator,
    Camera, Save, ArrowLeft, Fuel
} from 'lucide-react';
import staffService from '../../services/staffService';
import api from '../../services/api'; // Direct API for booking details if needed

const StaffInspection = () => {
    const { bookingId } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type'); // PICKUP or RETURN
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        bookingId: bookingId,
        type: type,
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
        // Fetch booking details to show vehicle info
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/bookings/${bookingId}`); // Assuming endpoint exists
                setBooking(res.data);
                // Pre-fill some data if needed (e.g. odometer from vehicle if available)
            } catch (error) {
                console.error("Failed to load booking", error);
            }
        };
        fetchBooking();
    }, [bookingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await staffService.submitInspection({
                ...formData,
                bookingId: parseInt(bookingId) // Ensure ID is number
            });
            alert('Inspection submitted successfully!');
            navigate('/staff');
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit inspection');
        } finally {
            setLoading(false);
        }
    };

    if (!booking && !loading) return <div className="p-6">Loading booking info...</div>;

    const isPickup = type === 'PICKUP';

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className={`bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm`}>
                <div className="container mx-auto max-w-3xl flex items-center justify-between">
                    <button onClick={() => navigate('/staff')} className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        {isPickup ? 'Vehicle Handover' : 'Vehicle Return'}
                        <span className="text-gray-400 font-normal">#{booking?.bookingCode}</span>
                    </h1>
                </div>
            </div>

            <div className="container mx-auto max-w-3xl mt-6 px-4">
                {/* Vehicle Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex gap-6 items-center shadow-sm">
                    <img src={booking?.vehicleImageUrl} alt="Car" className="w-24 h-24 rounded-lg object-cover bg-gray-100" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{booking?.vehicleName}</h2>
                        <p className="text-gray-500">{booking?.vehicleLicensePlate}</p>
                        <div className="mt-2 flex gap-3 text-sm">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                {booking?.customerName}
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Meter Readings */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-semibold text-gray-700 flex items-center gap-2">
                            <Calculator size={18} /> Meter Readings
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (km)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.odometer}
                                        onChange={e => setFormData({ ...formData, odometer: parseInt(e.target.value) })}
                                    />
                                    <Truck className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Battery Level (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0" max="100"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.batteryLevel}
                                        onChange={e => setFormData({ ...formData, batteryLevel: parseInt(e.target.value) })}
                                    />
                                    <Battery className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Condition Check */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle size={18} /> Condition Assessment
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <label className="text-gray-700 font-medium">Charging Cable Present?</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer"
                                        checked={formData.chargingCablePresent}
                                        onChange={e => setFormData({ ...formData, chargingCablePresent: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Exterior Condition</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={formData.exteriorCondition}
                                        onChange={e => setFormData({ ...formData, exteriorCondition: e.target.value })}
                                    >
                                        <option value="GOOD">Good</option>
                                        <option value="DAMAGED">Damaged</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interior Condition</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={formData.interiorCondition}
                                        onChange={e => setFormData({ ...formData, interiorCondition: e.target.value })}
                                    >
                                        <option value="GOOD">Good</option>
                                        <option value="DAMAGED">Damaged</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Damage Report */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-semibold text-gray-700 flex items-center gap-2">
                            <AlertTriangle size={18} /> Damage Report
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center mb-4">
                                <input id="hasDamage" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    checked={formData.hasDamage}
                                    onChange={e => setFormData({ ...formData, hasDamage: e.target.checked })}
                                />
                                <label htmlFor="hasDamage" className="ml-2 text-sm font-medium text-gray-900">Vehicle has new visible damage</label>
                            </div>

                            {formData.hasDamage && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Damage Description</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50/50"
                                        placeholder="Describe scratches, dents, or other issues..."
                                        value={formData.damageDescription}
                                        onChange={e => setFormData({ ...formData, damageDescription: e.target.value })}
                                    ></textarea>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">General Notes</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Any other observations?"
                                    value={formData.inspectionNotes}
                                    onChange={e => setFormData({ ...formData, inspectionNotes: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/staff')}
                            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-2.5 rounded-lg bg-[#5fcf86] text-white font-bold hover:bg-[#4bc076] transition-all shadow-lg shadow-green-100 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : (
                                <>
                                    <Save size={18} /> Submit Inspection
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffInspection;
