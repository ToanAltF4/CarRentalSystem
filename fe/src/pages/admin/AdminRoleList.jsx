import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, ChevronLeft, Plus, Edit2, Trash2, X, Loader2, Users
} from 'lucide-react';
import roleService from '../../services/roleService';

/**
 * Admin Role Management Page
 */
const AdminRoleList = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({ roleName: '', description: '' });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await roleService.getAllRoles();
            setRoles(data);
        } catch (err) {
            console.error('Error fetching roles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        setFormError('');
        setActionLoading('create');
        try {
            const newRole = await roleService.createRole(formData);
            setRoles([...roles, newRole]);
            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create role');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        setFormError('');
        setActionLoading('update');
        try {
            const updated = await roleService.updateRole(selectedRole.id, formData);
            setRoles(roles.map(r => r.id === selectedRole.id ? updated : r));
            setShowEditModal(false);
            setSelectedRole(null);
            resetForm();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to update role');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteRole = async () => {
        setActionLoading('delete');
        try {
            await roleService.deleteRole(selectedRole.id);
            setRoles(roles.filter(r => r.id !== selectedRole.id));
            setShowDeleteModal(false);
            setSelectedRole(null);
        } catch (err) {
            alert('Failed to delete role. It may be in use.');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (role) => {
        setSelectedRole(role);
        setFormData({
            roleName: role.roleName?.replace('ROLE_', '') || '',
            description: role.description || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (role) => {
        setSelectedRole(role);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({ roleName: '', description: '' });
        setFormError('');
    };

    const getRoleColor = (roleName) => {
        const colors = {
            'ROLE_ADMIN': 'bg-purple-100 text-purple-700 border-purple-200',
            'ROLE_MANAGER': 'bg-blue-100 text-blue-700 border-blue-200',
            'ROLE_OPERATOR': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'ROLE_STAFF': 'bg-teal-100 text-teal-700 border-teal-200',
            'ROLE_DRIVER': 'bg-orange-100 text-orange-700 border-orange-200',
            'ROLE_CUSTOMER': 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return colors[roleName] || 'bg-gray-100 text-gray-600 border-gray-200';
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
                    <h1 className="text-xl font-bold text-secondary">Role Management</h1>
                    <button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={18} />
                        Add Role
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
                    <ChevronLeft size={16} /> Back to Dashboard
                </Link>

                {/* Stats */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Shield className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                            <p className="text-xs text-gray-500">Total Roles</p>
                        </div>
                    </div>
                </div>

                {/* Roles Grid */}
                <div className="grid gap-4">
                    {roles.map(role => (
                        <div key={role.id} className={`bg-white rounded-xl p-5 border shadow-sm ${getRoleColor(role.roleName)}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {role.roleName?.replace('ROLE_', '')}
                                        </h3>
                                        <p className="text-sm opacity-75">
                                            {role.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(role)}
                                        className="p-2 bg-white/80 hover:bg-white rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(role)}
                                        className="p-2 bg-white/80 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {roles.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No roles found
                        </div>
                    )}
                </div>
            </div>

            {/* Create Role Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Create New Role</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                <div className="flex items-center">
                                    <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 text-sm">ROLE_</span>
                                    <input
                                        type="text"
                                        value={formData.roleName}
                                        onChange={(e) => setFormData({ ...formData, roleName: e.target.value.toUpperCase() })}
                                        className="flex-1 px-4 py-2.5 rounded-r-lg border border-gray-200 focus:border-primary outline-none uppercase"
                                        placeholder="MANAGER"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                    rows={3}
                                    placeholder="Role description..."
                                />
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

            {/* Edit Role Modal */}
            {showEditModal && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Edit Role</h3>
                            <button onClick={() => { setShowEditModal(false); setSelectedRole(null); }} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                <div className="flex items-center">
                                    <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 text-sm">ROLE_</span>
                                    <input
                                        type="text"
                                        value={formData.roleName}
                                        onChange={(e) => setFormData({ ...formData, roleName: e.target.value.toUpperCase() })}
                                        className="flex-1 px-4 py-2.5 rounded-r-lg border border-gray-200 focus:border-primary outline-none uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setSelectedRole(null); }}
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
            {showDeleteModal && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-600" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Role?</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete <strong>{selectedRole.roleName?.replace('ROLE_', '')}</strong>? Users with this role will lose access.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setSelectedRole(null); }}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteRole}
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
        </div>
    );
};

export default AdminRoleList;
