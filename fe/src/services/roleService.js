import api from './api';

/**
 * Role Service - CRUD operations for roles
 */

export const getAllRoles = async () => {
    const response = await api.get('/v1/admin/roles');
    return response.data;
};

export const getRoleById = async (id) => {
    const response = await api.get(`/v1/admin/roles/${id}`);
    return response.data;
};

export const createRole = async (roleData) => {
    const response = await api.post('/v1/admin/roles', roleData);
    return response.data;
};

export const updateRole = async (id, roleData) => {
    const response = await api.put(`/v1/admin/roles/${id}`, roleData);
    return response.data;
};

export const deleteRole = async (id) => {
    await api.delete(`/v1/admin/roles/${id}`);
};

export default {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};
