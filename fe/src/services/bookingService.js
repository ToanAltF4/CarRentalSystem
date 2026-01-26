import api from './api';

const bookingService = {
    // Create a new booking
    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    // Get booking by ID
    getById: async (id) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    // Get booking by code
    getByCode: async (code) => {
        const response = await api.get(`/bookings/code/${code}`);
        return response.data;
    },

    // Get all bookings (admin)
    getAll: async () => {
        const response = await api.get('/bookings');
        return response.data;
    },

    // Get bookings by customer email
    getByEmail: async (email) => {
        const response = await api.get(`/bookings/customer?email=${email}`);
        return response.data;
    },

    // Get bookings by status
    getByStatus: async (status) => {
        const response = await api.get(`/bookings/status/${status}`);
        return response.data;
    },

    // Get upcoming bookings
    getUpcoming: async () => {
        const response = await api.get('/bookings/upcoming');
        return response.data;
    },

    // Update booking status
    updateStatus: async (id, status) => {
        const response = await api.patch(`/bookings/${id}/status?status=${status}`);
        return response.data;
    },

    // Cancel booking
    cancel: async (id) => {
        const response = await api.post(`/bookings/${id}/cancel`);
        return response.data;
    }
};

export default bookingService;
