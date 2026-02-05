import api from './api';

/**
 * User Service - CRUD operations for users
 */

// Get all users
export const getAllUsers = async () => {
    const response = await api.get('/v1/admin/users');
    return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
    const response = await api.get(`/v1/admin/users/${id}`);
    return response.data;
};

// Get users by role
export const getUsersByRole = async (roleName) => {
    const response = await api.get(`/v1/admin/users/by-role/${roleName}`);
    return response.data;
};

// Create new user
export const createUser = async (userData) => {
    const response = await api.post('/v1/admin/users', userData);
    return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
    const response = await api.put(`/v1/admin/users/${id}`, userData);
    return response.data;
};

// Delete user
export const deleteUser = async (id) => {
    await api.delete(`/v1/admin/users/${id}`);
};

// Toggle user status
export const toggleUserStatus = async (id) => {
    const response = await api.patch(`/v1/admin/users/${id}/toggle-status`);
    return response.data;
};

// Approve license
export const approveLicense = async (userId) => {
    const response = await api.put(`/v1/admin/users/${userId}/approve-license`);
    return response.data;
};

// Reject license
export const rejectLicense = async (userId) => {
    const response = await api.put(`/v1/admin/users/${userId}/reject-license`);
    return response.data;
};

// Get users by license status
export const getUsersByLicenseStatus = async (status) => {
    const response = await api.get(`/v1/admin/users/by-license-status/${status}`);
    return response.data;
};

export default {
    getAllUsers,
    getUserById,
    getUsersByRole,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    approveLicense,
    rejectLicense,
    getUsersByLicenseStatus
};
