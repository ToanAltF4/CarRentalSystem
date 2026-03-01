import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import vehicleService from '../../services/vehicleService';
import Pagination from '../../components/common/Pagination';

const AdminVehicleList = () => {
    const PAGE_SIZE = 10;
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleService.getAll();
            setVehicles(data);
        } catch (err) {
            setError('Failed to load vehicles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await vehicleService.delete(id);
            setVehicles(vehicles.filter(v => v.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete vehicle');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const updated = await vehicleService.updateStatus(id, newStatus);
            setVehicles(vehicles.map(v => v.id === id ? updated : v));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const filtered = vehicles.filter(v => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            v.licensePlate.toLowerCase().includes(q) ||
            v.vin?.toLowerCase().includes(q) ||
            v.categoryBrand.toLowerCase().includes(q) ||
            v.categoryName.toLowerCase().includes(q)
        );
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, vehicles]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedVehicles = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const getStatusBadge = (status) => {
        const map = {
            AVAILABLE: 'bg-green-100 text-green-800',
            MAINTENANCE: 'bg-yellow-100 text-yellow-800',
            INACTIVE: 'bg-gray-200 text-gray-800',
        };
        return (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${map[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5fcf86]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Vehicles (Physical Cars)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage individual car instances.{' '}
                        <Link to="/admin/categories" className="text-[#5fcf86] hover:underline">Manage Categories →</Link>
                    </p>
                </div>
                <Link
                    to="/admin/vehicles/add"
                    className="px-4 py-2.5 bg-[#5fcf86] text-white rounded-lg font-semibold hover:bg-[#4ab872] transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Vehicle
                </Link>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by license plate, VIN, brand, or model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5fcf86] focus:border-transparent"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odometer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        No vehicles found
                                    </td>
                                </tr>
                            ) : (
                                paginatedVehicles.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono font-semibold text-gray-800">{v.licensePlate}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-800">{v.categoryBrand}</div>
                                            <div className="text-sm text-gray-500">{v.categoryName} — {v.categoryModel}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{v.vin || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{v.odometer ? `${v.odometer.toLocaleString()} km` : '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {v.currentBatteryPercent != null ? `${v.currentBatteryPercent}%` : '—'}
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(v.status)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/admin/vehicles/edit/${v.id}`}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                {v.status === 'AVAILABLE' && (
                                                    <button
                                                        onClick={() => handleStatusChange(v.id, 'MAINTENANCE')}
                                                        className="px-3 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                                                    >
                                                        Maintenance
                                                    </button>
                                                )}
                                                {v.status === 'AVAILABLE' && (
                                                    <button
                                                        onClick={() => handleStatusChange(v.id, 'INACTIVE')}
                                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                                {v.status === 'MAINTENANCE' && (
                                                    <button
                                                        onClick={() => handleStatusChange(v.id, 'AVAILABLE')}
                                                        className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                    >
                                                        Available
                                                    </button>
                                                )}
                                                {v.status === 'MAINTENANCE' && (
                                                    <button
                                                        onClick={() => handleStatusChange(v.id, 'INACTIVE')}
                                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                                {v.status === 'INACTIVE' && (
                                                    <button
                                                        onClick={() => handleStatusChange(v.id, 'AVAILABLE')}
                                                        className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(v.id)}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {filtered.length > 0 && (
                <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                />
            )}

            <div className="mt-4 text-sm text-gray-500">
                Showing {filtered.length} of {vehicles.length} vehicles
            </div>
        </div>
    );
};

export default AdminVehicleList;
