import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import vehicleService from '../../services/vehicleService';
import vehicleCategoryService from '../../services/vehicleCategoryService';

export default function AdminAddVehiclePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        vehicleCategoryId: '',
        licensePlate: '',
        vin: '',
        odometer: '',
        currentBatteryPercent: '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await vehicleCategoryService.getAll();
                setCategories(data);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await vehicleService.create(formData);
            navigate('/admin/vehicles');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/admin/vehicles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
                ← Back to Vehicles
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Vehicle</h1>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Category *</label>
                    <select
                        name="vehicleCategoryId"
                        value={formData.vehicleCategoryId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent"
                    >
                        <option value="">Select a category...</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.brand} {cat.name} — {cat.model}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                        Don&apos;t see the right category?{' '}
                        <Link to="/admin/categories/add" className="text-[#5fcf86] hover:underline">Create one →</Link>
                    </p>
                </div>

                {/* License Plate */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                    <input
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent font-mono"
                        placeholder="e.g. 59A-12345"
                    />
                </div>

                {/* VIN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                    <input
                        name="vin"
                        value={formData.vin}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent font-mono"
                        placeholder="Vehicle Identification Number"
                    />
                </div>

                {/* Odometer & Battery */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (km)</label>
                        <input
                            name="odometer"
                            type="number"
                            min="0"
                            value={formData.odometer}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Battery (%)</label>
                        <input
                            name="currentBatteryPercent"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.currentBatteryPercent}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/admin/vehicles')} className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-semibold text-white bg-[#5fcf86] hover:bg-[#4ab872] rounded-lg transition-colors disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Vehicle'}
                    </button>
                </div>
            </form>
        </div>
    );
}
