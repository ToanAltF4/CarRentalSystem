import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import vehicleService from '../../services/vehicleService';
import vehicleCategoryService from '../../services/vehicleCategoryService';

export default function AdminEditVehiclePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        const fetchData = async () => {
            try {
                const [vehicle, cats] = await Promise.all([
                    vehicleService.getById(id),
                    vehicleCategoryService.getAll(),
                ]);
                setCategories(cats);
                setFormData({
                    vehicleCategoryId: vehicle.categoryId || '',
                    licensePlate: vehicle.licensePlate || '',
                    vin: vehicle.vin || '',
                    odometer: vehicle.odometer || '',
                    currentBatteryPercent: vehicle.currentBatteryPercent || '',
                });
            } catch (err) {
                setError('Failed to load vehicle');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await vehicleService.update(id, formData);
            navigate('/admin/vehicles');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update vehicle');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5fcf86]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/admin/vehicles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
                ← Back to Vehicles
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Vehicle</h1>

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
                    <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-semibold text-white bg-[#5fcf86] hover:bg-[#4ab872] rounded-lg transition-colors disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
