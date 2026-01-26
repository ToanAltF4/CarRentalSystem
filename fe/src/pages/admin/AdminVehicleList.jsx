import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import { formatPrice } from '../../utils/formatters';

const AdminVehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            // vehicleService.getAll returns the backend DTO list directly
            const data = await vehicleService.getAll();
            setVehicles(data);
        } catch (err) {
            console.error("Error fetching vehicles:", err);
            setError("Failed to load vehicles.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this vehicle?")) {
            try {
                await vehicleService.delete(id);
                // Remove from state
                setVehicles(prev => prev.filter(v => v.id !== id));
            } catch (err) {
                console.error("Delete failed:", err);
                alert("Failed to delete vehicle. It might be rented.");
            }
        }
    };

    // Filter vehicles logic
    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const stats = {
        total: vehicles.length,
        available: vehicles.filter(v => v.status === 'AVAILABLE').length,
        rented: vehicles.filter(v => v.status === 'RENTED').length,
        maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-700';
            case 'RENTED': return 'bg-blue-100 text-blue-700';
            case 'MAINTENANCE': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-secondary">Fleet Management</h1>
                        <p className="text-sm text-gray-500">Manage your entire vehicle inventory</p>
                    </div>
                    <Link
                        to="/admin/vehicles/add"
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add New Vehicle
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-2xl font-bold text-secondary">{stats.total}</p>
                        <p className="text-xs text-gray-500 uppercase">Total Vehicles</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                        <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                        <p className="text-xs text-gray-500 uppercase">Available</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600">{stats.rented}</p>
                        <p className="text-xs text-gray-500 uppercase">Rented</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
                        <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
                        <p className="text-xs text-gray-500 uppercase">Maintenance</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, brand, or license plate..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                    >
                        <option value="ALL">All Status</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="RENTED">Rented</option>
                        <option value="MAINTENANCE">Maintenance</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Vehicle</th>
                                        <th className="px-6 py-4 font-semibold">License Plate</th>
                                        <th className="px-6 py-4 font-semibold">Price / Day</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredVehicles.length > 0 ? (
                                        filteredVehicles.map(vehicle => (
                                            <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-14 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-200">
                                                            <img
                                                                src={vehicle.imageUrl || 'https://via.placeholder.com/150'}
                                                                alt={vehicle.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{vehicle.name}</div>
                                                            <div className="text-xs text-gray-500">{vehicle.brand}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-medium text-gray-700">
                                                    {vehicle.licensePlate}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-primary">
                                                    {formatPrice(vehicle.dailyRate)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                                                        {vehicle.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/admin/vehicles/edit/${vehicle.id}`}
                                                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Link>
                                                        <button
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                            onClick={() => handleDelete(vehicle.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No vehicles found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminVehicleList;
