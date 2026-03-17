import api from './api';
import { cachedGet, invalidateCachedGet } from './requestCache';

/**
 * User Service - CRUD operations for users
 */
const USER_CACHE_PREFIX = 'users:';
const OPERATOR_LICENSE_CACHE_PREFIX = 'operator:licenses:';

// Get all users
export const getAllUsers = async () => {
    return cachedGet(
        `${USER_CACHE_PREFIX}all`,
        async () => {
            const response = await api.get('/v1/admin/users');
            return response.data;
        },
        20_000
    );
};

// Get user by ID
export const getUserById = async (id) => {
    return cachedGet(
        `${USER_CACHE_PREFIX}by-id:${id}`,
        async () => {
            const response = await api.get(`/v1/admin/users/${id}`);
            return response.data;
        },
        20_000
    );
};

// Get users by role
export const getUsersByRole = async (roleName) => {
    return cachedGet(
        `${USER_CACHE_PREFIX}by-role:${roleName}`,
        async () => {
            const response = await api.get(`/v1/admin/users/by-role/${roleName}`);
            return response.data;
        },
        20_000
    );
};

// Create new user
export const createUser = async (userData) => {
    const response = await api.post('/v1/admin/users', userData);
    invalidateCachedGet(USER_CACHE_PREFIX);
    invalidateCachedGet(OPERATOR_LICENSE_CACHE_PREFIX);
    return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
    const response = await api.put(`/v1/admin/users/${id}`, userData);
    invalidateCachedGet(USER_CACHE_PREFIX);
    invalidateCachedGet(OPERATOR_LICENSE_CACHE_PREFIX);
    return response.data;
};

// Delete user
export const deleteUser = async (id) => {
    await api.delete(`/v1/admin/users/${id}`);
    invalidateCachedGet(USER_CACHE_PREFIX);
    invalidateCachedGet(OPERATOR_LICENSE_CACHE_PREFIX);
};

// Toggle user status
export const toggleUserStatus = async (id) => {
    const response = await api.patch(`/v1/admin/users/${id}/toggle-status`);
    invalidateCachedGet(USER_CACHE_PREFIX);
    invalidateCachedGet(OPERATOR_LICENSE_CACHE_PREFIX);
    return response.data;
};

// Approve license
export const approveLicense = async (userId) => {
    const response = await api.put(`/v1/admin/users/${userId}/approve-license`);
    invalidateCachedGet(USER_CACHE_PREFIX);
    invalidateCachedGet(OPERATOR_LICENSE_CACHE_PREFIX);
    return response.data;
};

// Reject license
export const rejectLicense = async (userId) => {
    const response = await api.put(`/v1/admin/users/${userId}/reject-license`);
    invalidateCachedGet(USER_CACHE_PREFIX);
    invalidateCachedGet(OPERATOR_LICENSE_CACHE_PREFIX);
    return response.data;
};

// Get users by license status
export const getUsersByLicenseStatus = async (status) => {
    return cachedGet(
        `${USER_CACHE_PREFIX}by-license-status:${status}`,
        async () => {
            const response = await api.get(`/v1/admin/users/by-license-status/${status}`);
            return response.data;
        },
        20_000
    );
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
