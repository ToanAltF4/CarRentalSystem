import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Search, Filter, CheckCircle, XCircle, Clock,
    ChevronLeft, Eye, Shield, AlertCircle, Loader2, BadgeCheck
} from 'lucide-react';
import api from '../../services/api';

/**
 * Admin User Management Page
 * View all users and approve/reject driver licenses
 */
const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLicense, setFilterLicense] = useState('ALL');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/v1/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveLicense = async (userId) => {
        setActionLoading(userId);
        try {
            await api.put(`/v1/admin/users/${userId}/approve-license`);
            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? { ...u, licenseStatus: 'APPROVED' } : u
            ));
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, licenseStatus: 'APPROVED' });
            }
        } catch (err) {
            console.error('Error approving license:', err);
            alert('Failed to approve license');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectLicense = async (userId) => {
        setActionLoading(userId);
        try {
            await api.put(`/v1/admin/users/${userId}/reject-license`);
            setUsers(users.map(u =>
                u.id === userId ? { ...u, licenseStatus: 'REJECTED' } : u
            ));
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, licenseStatus: 'REJECTED' });
            }
        } catch (err) {
            console.error('Error rejecting license:', err);
            alert('Failed to reject license');
        } finally {
            setActionLoading(null);
        }
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLicense = filterLicense === 'ALL' || user.licenseStatus === filterLicense;
        return matchesSearch && matchesLicense;
    });

    // Stats
    const stats = {
        total: users.length,
        pending: users.filter(u => u.licenseStatus === 'PENDING').length,
        approved: users.filter(u => u.licenseStatus === 'APPROVED').length,
        rejected: users.filter(u => u.licenseStatus === 'REJECTED').length,
    };

    const getLicenseStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle size={12} /> Verified
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        <Clock size={12} /> Pending
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                        <XCircle size={12} /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        <AlertCircle size={12} /> None
                    </span>
                );
        }
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
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 mb-8">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-secondary">Admin Dashboard</h1>
                    <div className="text-sm text-gray-500">User Management</div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl">
                <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
                    <ChevronLeft size={16} /> Back to Dashboard
                </Link>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total Users</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="text-yellow-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                <p className="text-xs text-gray-500">Pending Review</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                <p className="text-xs text-gray-500">Verified</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="text-red-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                                <p className="text-xs text-gray-500">Rejected</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                            />
                        </div>

                        {/* License Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                value={filterLicense}
                                onChange={(e) => setFilterLicense(e.target.value)}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-primary outline-none"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending Review</option>
                                <option value="APPROVED">Verified</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="NONE">No License</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Users ({filteredUsers.length})</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">User</th>
                                    <th className="px-6 py-3 text-left">Role</th>
                                    <th className="px-6 py-3 text-left">License Status</th>
                                    <th className="px-6 py-3 text-left">License Number</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{user.fullName}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${user.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'ROLE_MANAGER' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                <Shield size={12} />
                                                {user.role?.replace('ROLE_', '')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getLicenseStatusBadge(user.licenseStatus)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.licenseNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* View License */}
                                                {user.licenseFrontImageUrl && (
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View License"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}

                                                {/* Approve/Reject buttons for pending */}
                                                {user.licenseStatus === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveLicense(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            {actionLoading === user.id ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <CheckCircle size={16} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectLicense(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* License Preview Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Driver's License</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                                    {selectedUser.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedUser.fullName}</p>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">License Number</p>
                                    <p className="font-medium">{selectedUser.licenseNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">License Type</p>
                                    <p className="font-medium">{selectedUser.licenseType || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Status</p>
                                    {getLicenseStatusBadge(selectedUser.licenseStatus)}
                                </div>
                            </div>

                            {selectedUser.licenseFrontImageUrl && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">License Image</p>
                                    <img
                                        src={selectedUser.licenseFrontImageUrl}
                                        alt="License Front"
                                        className="w-full rounded-lg border border-gray-200"
                                    />
                                </div>
                            )}

                            {selectedUser.licenseStatus === 'PENDING' && (
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleApproveLicense(selectedUser.id)}
                                        disabled={actionLoading === selectedUser.id}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === selectedUser.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <CheckCircle size={16} />
                                        )}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectLicense(selectedUser.id)}
                                        disabled={actionLoading === selectedUser.id}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserList;
