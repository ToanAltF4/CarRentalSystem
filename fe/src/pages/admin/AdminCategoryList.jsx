import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import vehicleCategoryService from '../../services/vehicleCategoryService';
import Pagination from '../../components/common/Pagination';

export default function AdminCategoryList() {
    const PAGE_SIZE = 10;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await vehicleCategoryService.getAll();
            setCategories(data.map(vehicleCategoryService.normalizeCategory));
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await vehicleCategoryService.delete(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete category');
        }
    };

    const filtered = categories.filter(cat => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            cat.brand.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q) ||
            cat.model.toLowerCase().includes(q)
        );
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categories]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedCategories = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const formatPrice = (price) => {
        if (!price) return '—';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
                    <h1 className="text-2xl font-bold text-gray-800">Vehicle Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage vehicle model catalog &amp; pricing</p>
                </div>
                <Link
                    to="/admin/categories/add"
                    className="px-4 py-2.5 bg-[#5fcf86] text-white rounded-lg font-semibold hover:bg-[#4ab872] transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Category
                </Link>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by brand, name, or model..."
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand / Name / Model</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicles</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                paginatedCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            {cat.primaryImageUrl ? (
                                                <img src={cat.primaryImageUrl} alt={cat.name} className="w-16 h-10 object-cover rounded" />
                                            ) : (
                                                <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                                    No img
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-800">{cat.brand}</div>
                                            <div className="text-sm text-gray-600">{cat.name} — {cat.model}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div>{cat.seats} seats • {cat.rangeKm} km</div>
                                            <div>{cat.batteryCapacityKwh} kWh</div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">
                                            {formatPrice(cat.dailyPrice)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="text-green-600 font-medium">{cat.availableCount}</span>
                                            <span className="text-gray-400"> / {cat.vehicleCount}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/admin/categories/edit/${cat.id}`}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
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
                Showing {filtered.length} of {categories.length} categories
            </div>
        </div>
    );
}
