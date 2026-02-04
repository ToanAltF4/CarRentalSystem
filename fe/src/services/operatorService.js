import api from './api';

/**
 * Service for Operator Role operations
 */
const operatorService = {
    // ==================== Dashboard Stats ====================
    getDashboardStats: async () => {
        const response = await api.get('/v1/operator/dashboard/stats');
        return response.data;
    },

    // ==================== Booking Management ====================
    getAllBookings: async () => {
        const response = await api.get('/v1/bookings');
        return response.data;
    },

    getTodayBookings: async () => {
        const response = await api.get('/v1/operator/bookings/today');
        return response.data;
    },

    getConfirmedBookings: async () => {
        const response = await api.get('/v1/operator/bookings/confirmed');
        return response.data;
    },

    approveBooking: async (bookingId) => {
        const response = await api.post(`/v1/operator/bookings/${bookingId}/approve`);
        return response.data;
    },

    rejectBooking: async (bookingId, reason) => {
        const response = await api.post(`/v1/operator/bookings/${bookingId}/reject`, { reason });
        return response.data;
    },

    // ==================== Staff Assignment ====================
    getAvailableStaff: async () => {
        const response = await api.get('/v1/operator/staff/available');
        return response.data;
    },

    getAvailableDrivers: async () => {
        const response = await api.get('/v1/operator/drivers/available');
        return response.data;
    },

    assignStaff: async (bookingId, staffId, driverId) => {
        const response = await api.post(`/v1/operator/bookings/${bookingId}/assign`, {
            bookingId, // Included for DTO validation
            staffId,
            driverId
        });
        return response.data;
    },

    unassignStaff: async (bookingId) => {
        const response = await api.delete(`/v1/operator/bookings/${bookingId}/assign`);
        return response.data;
    },

    getStaffAssignedBookings: async (staffId) => {
        const response = await api.get(`/v1/operator/staff/${staffId}/bookings`);
        return response.data;
    },

    // ==================== License Verification ====================
    getPendingLicenses: async () => {
        const response = await api.get('/v1/operator/licenses/pending');
        return response.data;
    },

    approveLicense: async (userId) => {
        const response = await api.post(`/v1/operator/users/${userId}/approve-license`);
        return response.data;
    },

    rejectLicense: async (userId, reason) => {
        const response = await api.post(`/v1/operator/users/${userId}/reject-license`, { reason });
        return response.data;
    }
};

export default operatorService;
