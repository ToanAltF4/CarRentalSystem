import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';
import vehicleService from '../../services/vehicleService';
import api from '../../services/api';

const AdminEditVehiclePage = () => {
    const { id } = useParams();
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState('');

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const data = await vehicleService.getById(id);
                console.log('Loaded vehicle data:', data); // Debug log

                // Populate form with existing data
                reset({
                    name: data.name,
                    brand: data.brand,
                    licensePlate: data.licensePlate,
                    category: data.categoryName || 'Sedan',
                    dailyRate: data.dailyRate,
                    seats: data.seats || 5,
                    batteryCapacityKwh: data.batteryCapacityKwh,
                    rangeKm: data.rangeKm,
                    description: data.description || '',
                    imageUrl: data.imageUrl
                });
                setCurrentImage(data.imageUrl);
            } catch (err) {
                console.error("Failed to load vehicle:", err);
                alert("Vehicle not found");
                navigate('/admin/vehicles');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchVehicle();
    }, [id, reset, navigate]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            // Ensure proper type conversion for API
            const payload = {
                name: data.name,
                model: data.name, // Backend requires model
                brand: data.brand,
                licensePlate: data.licensePlate,
                category: data.category,
                dailyRate: parseFloat(data.dailyRate) || 0,
                seats: parseInt(data.seats) || 5,
                batteryCapacityKwh: data.batteryCapacityKwh ? parseFloat(data.batteryCapacityKwh) : null,
                rangeKm: data.rangeKm ? parseInt(data.rangeKm) : null,
                description: data.description || '',
                imageUrl: data.imageUrl || currentImage
            };

            console.log('Sending update payload:', payload); // Debug log

            await api.put(`/v1/vehicles/${id}`, payload);
            alert("Vehicle Updated Successfully!");
            navigate('/admin/vehicles');
        } catch (error) {
            console.error("Error updating vehicle:", error);
            const msg = error.response?.data?.message || "Failed to update vehicle";
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = (url) => {
        setValue('imageUrl', url);
        setCurrentImage(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Admin Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 mb-8">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-secondary">Admin Dashboard</h1>
                    <div className="text-sm text-gray-500">Edit Vehicle</div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/admin/vehicles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
                    <ChevronLeft size={16} /> Back to Fleet
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Vehicle</h2>
                        <p className="text-sm text-gray-500">Update the vehicle details below.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-8">

                        {/* 1. Basic Info */}
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-primary pl-3">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        placeholder="e.g. Tesla Model Y"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <select
                                        {...register("brand", { required: "Brand is required" })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                                    >
                                        <option value="">Select Brand</option>
                                        <option value="Tesla">Tesla</option>
                                        <option value="VinFast">VinFast</option>
                                        <option value="BYD">BYD</option>
                                        <option value="Hyundai">Hyundai</option>
                                        <option value="Kia">Kia</option>
                                        <option value="Mercedes-Benz">Mercedes-Benz</option>
                                        <option value="BMW">BMW</option>
                                    </select>
                                    {errors.brand && <span className="text-xs text-red-500 mt-1">{errors.brand.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                                    <input
                                        {...register("licensePlate", { required: "License Plate is required" })}
                                        placeholder="e.g. 51H-123.45"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase"
                                    />
                                    {errors.licensePlate && <span className="text-xs text-red-500 mt-1">{errors.licensePlate.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        {...register("category", { required: "Category is required" })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Sedan">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Compact">Compact</option>
                                        <option value="Luxury">Luxury</option>
                                        <option value="Crossover">Crossover</option>
                                    </select>
                                    {errors.category && <span className="text-xs text-red-500 mt-1">{errors.category.message}</span>}
                                </div>
                            </div>
                        </div>

                        {/* 2. Specs & Image */}
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-primary pl-3">Specifications & Media</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price / Day (VND)</label>
                                            <input
                                                type="number"
                                                {...register("dailyRate", { required: true, min: 0 })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                                            <input
                                                type="number"
                                                {...register("seats", { required: true, min: 2, max: 9 })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Battery (kWh)</label>
                                            <input
                                                type="number" step="0.1"
                                                {...register("batteryCapacityKwh")}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Range (km)</label>
                                            <input
                                                type="number"
                                                {...register("rangeKm")}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                                        <textarea
                                            {...register("description")}
                                            rows="4"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <input type="hidden" {...register("imageUrl")} />
                                    {currentImage && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                                            <img src={currentImage} alt="Current" className="w-full h-40 object-cover rounded-lg border" />
                                        </div>
                                    )}
                                    <ImageUpload onUploadSuccess={handleImageUpload} />
                                    <p className="text-xs text-gray-400">Upload a new image to replace the current one.</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                            <button type="button" onClick={() => navigate('/admin/vehicles')} className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {submitting ? 'Saving...' : 'Update Vehicle'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditVehiclePage;
