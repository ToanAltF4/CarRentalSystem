import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';

const AdminAddVehiclePage = () => {
    // Demo vehicle templates for quick testing
    const demoVehicles = {
        tesla: { name: 'Tesla Model 3', brand: 'Tesla', licensePlate: '30A-TEST1', category: 'PREMIUM', dailyRate: 2375000, seats: 5, batteryCapacityKwh: 75, rangeKm: 500, description: 'Tesla Model 3 - Premium electric sedan with autopilot' },
        vinfast: { name: 'VinFast VF 8', brand: 'VinFast', licensePlate: '29A-TEST2', category: 'SUV', dailyRate: 2125000, seats: 5, batteryCapacityKwh: 87.7, rangeKm: 420, description: 'VinFast VF 8 - Smart electric SUV made in Vietnam' },
        byd: { name: 'BYD Seal', brand: 'BYD', licensePlate: '51A-TEST3', category: 'PREMIUM', dailyRate: 2500000, seats: 5, batteryCapacityKwh: 82.5, rangeKm: 570, description: 'BYD Seal - Sporty electric sedan with blade battery' },
        hyundai: { name: 'Hyundai Ioniq 5', brand: 'Hyundai', licensePlate: '43A-TEST4', category: 'STANDARD', dailyRate: 2000000, seats: 5, batteryCapacityKwh: 72.6, rangeKm: 480, description: 'Hyundai Ioniq 5 - Award-winning EV crossover' },
        mercedes: { name: 'Mercedes EQS 450+', brand: 'Mercedes', licensePlate: '30A-TEST5', category: 'LUXURY', dailyRate: 5500000, seats: 5, batteryCapacityKwh: 107.8, rangeKm: 770, description: 'Mercedes EQS - Luxury flagship electric sedan' }
    };

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        defaultValues: demoVehicles.vinfast
    });
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const fillDemoVehicle = (type) => {
        const vehicle = demoVehicles[type];
        Object.keys(vehicle).forEach(key => setValue(key, vehicle[key]));
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            console.log("Submitting Vehicle Data:", data);

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
                imageUrl: data.imageUrl
            };

            // Real Backend Call
            const response = await api.post('/v1/vehicles', payload);

            alert("Vehicle Added Successfully!");
            navigate('/admin/vehicles');

        } catch (error) {
            console.error("Error creating vehicle:", error);
            const msg = error.response?.data?.message || "Failed to add vehicle";
            setSubmitting(false);
            alert(msg);
        }
    };

    const handleImageUpload = (url) => {
        setValue('imageUrl', url);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Admin Header Stub */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 mb-8">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-secondary">Admin Dashboard</h1>
                    <div className="text-sm text-gray-500">Welcome, Manager</div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/admin/vehicles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
                    <ChevronLeft size={16} /> Back to Fleet
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">Add New Vehicle</h2>
                        <p className="text-sm text-gray-500">Enter details to add a new EV to your fleet.</p>

                        {/* Demo Quick Fill Buttons */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-xs text-gray-500 mb-2">🚗 Quick Fill (Demo):</p>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => fillDemoVehicle('tesla')} className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600">Tesla</button>
                                <button type="button" onClick={() => fillDemoVehicle('vinfast')} className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600">VinFast</button>
                                <button type="button" onClick={() => fillDemoVehicle('byd')} className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600">BYD</button>
                                <button type="button" onClick={() => fillDemoVehicle('hyundai')} className="px-3 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-md hover:bg-indigo-600">Hyundai</button>
                                <button type="button" onClick={() => fillDemoVehicle('mercedes')} className="px-3 py-1.5 text-xs font-medium bg-gray-800 text-white rounded-md hover:bg-gray-900">Mercedes</button>
                            </div>
                        </div>
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
                                        <option value="Mercedes">Mercedes</option>
                                        <option value="BMW">BMW</option>
                                        <option value="Audi">Audi</option>
                                        <option value="Porsche">Porsche</option>
                                        <option value="MG">MG</option>
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
                                        <option value="ECONOMY">Economy</option>
                                        <option value="STANDARD">Standard</option>
                                        <option value="PREMIUM">Premium</option>
                                        <option value="LUXURY">Luxury</option>
                                        <option value="SUV">SUV</option>
                                        <option value="COMPACT">Compact</option>
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
                                    {/* Number Fields */}
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
                                    {/* Image Upload Component */}
                                    {/* We register a hidden input to hold the URL */}
                                    <input type="hidden" {...register("imageUrl", { required: "Image is required" })} />
                                    <ImageUpload onUploadSuccess={handleImageUpload} />
                                    {errors.imageUrl && <span className="text-xs text-red-500">Please upload an image</span>}
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
                                {submitting ? 'Saving...' : 'Add Vehicle'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAddVehiclePage;
