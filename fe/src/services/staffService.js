import api from './api';

const staffService = {
    // Get assigned tasks (Staff)
    getMyTasks: async () => {
        const response = await api.get('/v1/staff/tasks');
        return response.data;
    },

    // Get handled task history (returned/completed)
    getTaskHistory: async () => {
        const response = await api.get('/v1/staff/tasks/history');
        return response.data;
    },

    // Get task detail by booking id for current staff
    getTaskDetail: async (bookingId) => {
        const response = await api.get(`/v1/staff/tasks/${bookingId}`);
        return response.data;
    },

    // Submit inspection (Pickup/Return)
    submitInspection: async (data) => {
        const response = await api.post('/v1/staff/inspection', data);
        return response.data;
    },
};

export default staffService;
