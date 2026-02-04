import api from './api';

const staffService = {
    // Get assigned tasks (Staff)
    getMyTasks: async () => {
        const response = await api.get('/staff/tasks');
        return response.data;
    },

    // Submit inspection (Pickup/Return)
    submitInspection: async (data) => {
        const response = await api.post('/staff/inspection', data);
        return response.data;
    },
};

export default staffService;
