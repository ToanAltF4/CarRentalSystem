import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Search, Filter, CheckCircle, XCircle, Clock,
    ChevronLeft, Eye, Shield, AlertCircle, Loader2,
    Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import userService from '../../services/userService';

/**
 * Admin User Management Page with Full CRUD
 */
const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLicense, setFilterLicense] = useState('ALL');
    const [filterRole, setFilterRole] = useState('ALL');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        roleId: 1,
        status: 'ACTIVE'
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // CRUD Operations
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setFormError('');
        setActionLoading('create');
        try {
            const newUser = await userService.createUser(formData);
            setUsers([...users, newUser]);
            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setFormError('');
        setActionLoading('update');
        try {
            const updated = await userService.updateUser(selectedUser.id, formData);
            setUsers(users.map(u => u.id === selectedUser.id ? updated : u));
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async () => {
        setActionLoading('delete');
        try {
            await userService.deleteUser(selectedUser.id);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (err) {
            alert('Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (user) => {
        setActionLoading(user.id);
        try {
            const updated = await userService.toggleUserStatus(user.id);
            setUsers(users.map(u => u.id === user.id ? updated : u));
        } catch (err) {
            alert('Failed to toggle status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveLicense = async (userId) => {
        setActionLoading(userId);
        try {
            const updated = await userService.approveLicense(userId);
            setUsers(users.map(u => u.id === userId ? updated : u));
            if (selectedUser?.id === userId) {
                setSelectedUser(updated);
            }
        } catch (err) {
            alert('Failed to approve license');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectLicense = async (userId) => {
        setActionLoading(userId);
        try {
            const updated = await userService.rejectLicense(userId);
            setUsers(users.map(u => u.id === userId ? updated : u));
            if (selectedUser?.id === userId) {
                setSelectedUser(updated);
            }
        } catch (err) {
            alert('Failed to reject license');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            password: '',
            phone: user.phone || '',
            roleId: user.roleId || 1,
            status: user.status || 'ACTIVE'
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            password: '',
            phone: '',
            roleId: 1,
            status: 'ACTIVE'
        });
        setFormError('');
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLicense = filterLicense === 'ALL' || user.licenseStatus === filterLicense;
        const matchesRole = filterRole === 'ALL' || user.roleName === filterRole;
        return matchesSearch && matchesLicense && matchesRole;
    });

    // Stats
    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'ACTIVE').length,
        pending: users.filter(u => u.licenseStatus === 'PENDING').length,
        drivers: users.filter(u => u.roleName === 'ROLE_DRIVER').length,
    };

    const getRoleBadge = (roleName) => {
        const roleColors = {
            'ROLE_ADMIN': 'bg-purple-100 text-purple-700',
            'ROLE_MANAGER': 'bg-blue-100 text-blue-700',
            'ROLE_OPERATOR': 'bg-indigo-100 text-indigo-700',
            'ROLE_STAFF': 'bg-teal-100 text-teal-700',
            'ROLE_DRIVER': 'bg-orange-100 text-orange-700',
            'ROLE_CUSTOMER': 'bg-gray-100 text-gray-600',
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${roleColors[roleName] || 'bg-gray-100 text-gray-600'}`}>
                <Shield size={12} />
                {roleName?.replace('ROLE_', '')}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        if (status === 'ACTIVE') {
            return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                <CheckCircle size={12} /> Active
            </span>;
        }
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            <XCircle size={12} /> Inactive
        </span>;
    };

    const getLicenseStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <CheckCircle size={12} /> Verified
                </span>;
            case 'PENDING':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                    <Clock size={12} /> Pending
                </span>;
            case 'REJECTED':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                    <XCircle size={12} /> Rejected
                </span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    <AlertCircle size={12} /> None
                </span>;
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
                    <h1 className="text-xl font-bold text-secondary">User Management</h1>
                    <button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={18} />
                        Add User
                    </button>
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
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                <p className="text-xs text-gray-500">Active</p>
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
                                <p className="text-xs text-gray-500">Pending License</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Shield className="text-orange-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{stats.drivers}</p>
                                <p className="text-xs text-gray-500">Drivers</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
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
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-primary outline-none"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="ROLE_ADMIN">Admin</option>
                                <option value="ROLE_MANAGER">Manager</option>
                                <option value="ROLE_OPERATOR">Operator</option>
                                <option value="ROLE_STAFF">Staff</option>
                                <option value="ROLE_DRIVER">Driver</option>
                                <option value="ROLE_CUSTOMER">Customer</option>
                            </select>
                            <select
                                value={filterLicense}
                                onChange={(e) => setFilterLicense(e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-primary outline-none"
                            >
                                <option value="ALL">All License Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Users ({filteredUsers.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">User</th>
                                    <th className="px-6 py-3 text-left">Role</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">License</th>
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
                                            {getRoleBadge(user.roleName)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(user.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getLicenseStatusBadge(user.licenseStatus)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* View License */}
                                                {user.licenseFrontImageUrl && (
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="View License"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                                {/* Toggle Status */}
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    disabled={actionLoading === user.id}
                                                    className={`p-2 rounded-lg ${user.status === 'ACTIVE' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {actionLoading === user.id ? <Loader2 size={16} className="animate-spin" /> :
                                                        user.status === 'ACTIVE' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => openDeleteModal(user)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                {/* Approve/Reject for pending license */}
                                                {user.licenseStatus === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveLicense(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                            title="Approve License"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectLicense(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                            title="Reject License"
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

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                >
                                    <option value={1}>Customer</option>
                                    <option value={2}>Admin</option>
                                    <option value={3}>Staff</option>
                                    <option value={4}>Operator</option>
                                    <option value={5}>Driver</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === 'create'}
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {actionLoading === 'create' ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
                            <button onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                >
                                    <option value={1}>Customer</option>
                                    <option value={2}>Admin</option>
                                    <option value={3}>Staff</option>
                                    <option value={4}>Operator</option>
                                    <option value={5}>Driver</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === 'update'}
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {actionLoading === 'update' ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-600" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete <strong>{selectedUser.fullName}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={actionLoading === 'delete'}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                    {actionLoading === 'delete' ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* License Preview Modal */}
            {selectedUser && !showEditModal && !showDeleteModal && selectedUser.licenseFrontImageUrl && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Driver's License</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
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
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {actionLoading === selectedUser.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectLicense(selectedUser.id)}
                                        disabled={actionLoading === selectedUser.id}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50"
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
