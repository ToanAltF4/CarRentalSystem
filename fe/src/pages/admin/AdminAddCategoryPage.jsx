import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import vehicleCategoryService from '../../services/vehicleCategoryService';

export default function AdminAddCategoryPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [formData, setFormData] = useState({
        brand: '', name: '', model: '', seats: '', batteryCapacityKwh: '',
        rangeKm: '', chargingTimeHours: '', description: '',
        imageUrls: [''],
        dailyPrice: '', weeklyPrice: '', monthlyPrice: '', overtimeFeePerHour: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, value) => {
        const urls = [...formData.imageUrls];
        urls[index] = value;
        setFormData(prev => ({ ...prev, imageUrls: urls }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
    };

    const removeImageField = (index) => {
        const urls = formData.imageUrls.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, imageUrls: urls.length ? urls : [''] }));
    };

    const handleImageFileChange = async (index, event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('Only image files are allowed');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setUploadError('Image size must be <= 10MB');
            return;
        }

        try {
            setUploadError('');
            setUploadingIndex(index);
            const form = new FormData();
            form.append('file', file);

            const res = await api.post('/v1/upload/vehicles', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            handleImageChange(index, res.data?.url || '');
        } catch (err) {
            setUploadError(err.response?.data?.error || 'Failed to upload image');
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                brand: formData.brand,
                name: formData.name,
                model: formData.model,
                seats: formData.seats ? parseInt(formData.seats) : null,
                batteryCapacityKwh: formData.batteryCapacityKwh ? parseFloat(formData.batteryCapacityKwh) : null,
                rangeKm: formData.rangeKm ? parseInt(formData.rangeKm) : null,
                chargingTimeHours: formData.chargingTimeHours ? parseFloat(formData.chargingTimeHours) : null,
                description: formData.description || null,
                imageUrls: formData.imageUrls.filter(u => u.trim()),
                dailyPrice: parseFloat(formData.dailyPrice),
                weeklyPrice: formData.weeklyPrice ? parseFloat(formData.weeklyPrice) : null,
                monthlyPrice: formData.monthlyPrice ? parseFloat(formData.monthlyPrice) : null,
                overtimeFeePerHour: parseFloat(formData.overtimeFeePerHour),
            };
            await vehicleCategoryService.create(payload);
            navigate('/admin/categories');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Link to="/admin/categories" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
                ← Back to Categories
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Vehicle Category</h1>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                {/* Brand / Name / Model */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                        <input name="brand" value={formData.brand} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" placeholder="e.g. Tesla" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (Line) *</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" placeholder="e.g. Model 3" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model (Variant) *</label>
                        <input name="model" value={formData.model} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" placeholder="e.g. Standard Range" />
                    </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                        <input name="seats" type="number" min="1" value={formData.seats} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Battery (kWh)</label>
                        <input name="batteryCapacityKwh" type="number" step="0.01" value={formData.batteryCapacityKwh} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Range (km)</label>
                        <input name="rangeKm" type="number" value={formData.rangeKm} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charging (hours)</label>
                        <input name="chargingTimeHours" type="number" step="0.01" value={formData.chargingTimeHours} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs (Link or Upload)</label>
                    {formData.imageUrls.map((url, i) => (
                        <div key={i} className="mb-2">
                            <div className="flex gap-2">
                                <input value={url} onChange={(e) => handleImageChange(i, e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                                <label className={`px-3 py-2 text-sm rounded-lg border transition-colors ${uploadingIndex === i ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#5fcf86] border-[#5fcf86] hover:bg-green-50 cursor-pointer'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingIndex !== null}
                                        onChange={(e) => handleImageFileChange(i, e)}
                                    />
                                    {uploadingIndex === i ? 'Uploading...' : 'Choose File'}
                                </label>
                                {formData.imageUrls.length > 1 && (
                                    <button type="button" onClick={() => removeImageField(i)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">X</button>
                                )}
                            </div>
                            {url && (
                                <img src={url} alt={`preview-${i}`} className="mt-2 h-20 w-32 object-cover rounded border border-gray-200" />
                            )}
                        </div>
                    ))}
                    {uploadError && <p className="mb-2 text-sm text-red-600">{uploadError}</p>}
                    <button type="button" onClick={addImageField} className="text-sm text-[#5fcf86] hover:underline">+ Add image</button>
                </div>

                {/* Pricing */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Pricing</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Price (VND) *</label>
                            <input name="dailyPrice" type="number" step="1000" value={formData.dailyPrice} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Price</label>
                            <input name="weeklyPrice" type="number" step="1000" value={formData.weeklyPrice} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
                            <input name="monthlyPrice" type="number" step="1000" value={formData.monthlyPrice} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Fee/hr *</label>
                            <input name="overtimeFeePerHour" type="number" step="1000" value={formData.overtimeFeePerHour} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/admin/categories')} className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading || uploadingIndex !== null} className="px-6 py-2.5 text-sm font-semibold text-white bg-[#5fcf86] hover:bg-[#4ab872] rounded-lg transition-colors disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    );
}

