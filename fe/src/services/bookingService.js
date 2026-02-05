import api from './api';

/**
 * Booking Service
 * Connects to /api/v1/bookings/* endpoints
 */
const bookingService = {
    // ========== CUSTOMER ENDPOINTS ==========

    /**
     * Create a new booking
     */
    createBooking: async (bookingData) => {
        const response = await api.post('/v1/bookings', bookingData);
        return response.data;
    },

    // ========== BOOKING WIZARD OPTIONS ==========

    /**
     * Get all rental types (SELF_DRIVE, WITH_DRIVER)
     */
    getRentalTypes: async () => {
        const response = await api.get('/v1/booking-options/rental-types');
        return response.data;
    },

    /**
     * Get all pickup methods (STORE, DELIVERY)
     */
    getPickupMethods: async () => {
        const response = await api.get('/v1/booking-options/pickup-methods');
        return response.data;
    },

    /**
     * Calculate driver fee for WITH_DRIVER rental
     * @param {number} days - Number of rental days
     * @param {number} [vehicleCategoryId] - Optional vehicle category ID for specific pricing
     */
    getDriverFee: async (days, vehicleCategoryId) => {
        const params = { days };
        if (vehicleCategoryId) {
            params.vehicleCategoryId = vehicleCategoryId;
        }
        const response = await api.get('/v1/booking-options/driver-fee', { params });
        return response.data;
    },

    /**
     * Calculate delivery fee based on address
     * @param {string} deliveryAddress - Delivery address
     */
    calculateDeliveryFee: async (deliveryAddress) => {
        const response = await api.post('/v1/booking-options/calculate-delivery-fee', { deliveryAddress });
        return response.data;
    },

    /**
     * Get current pricing info (driver daily fee, delivery base fee, etc.)
     */
    getPricingInfo: async () => {
        const response = await api.get('/v1/booking-options/pricing-info');
        return response.data;
    },

    /**
     * Get booking by ID
     */
    getById: async (id) => {
        const response = await api.get(`/v1/bookings/${id}`);
        return response.data;
    },

    /**
     * Get booking by booking code
     */
    getByCode: async (code) => {
        const response = await api.get(`/v1/bookings/code/${code}`);
        return response.data;
    },

    /**
     * Get bookings by customer email
     */
    getByEmail: async (email) => {
        const response = await api.get('/v1/bookings/customer', { params: { email } });
        return response.data;
    },

    /**
     * Cancel a booking
     */
    cancel: async (id) => {
        const response = await api.post(`/v1/bookings/${id}/cancel`);
        return response.data;
    },

    // ========== ADMIN ENDPOINTS ==========

    /**
     * Get all bookings (Admin only)
     */
    getAll: async () => {
        const response = await api.get('/v1/bookings');
        return response.data;
    },

    /**
     * Get bookings by status
     */
    getByStatus: async (status) => {
        const response = await api.get(`/v1/bookings/status/${status}`);
        return response.data;
    },

    /**
     * Get bookings by vehicle ID
     */
    getByVehicle: async (vehicleId) => {
        const response = await api.get(`/v1/bookings/vehicle/${vehicleId}`);
        return response.data;
    },

    /**
     * Get upcoming bookings
     */
    getUpcoming: async () => {
        const response = await api.get('/v1/bookings/upcoming');
        return response.data;
    },

    /**
     * Update booking status (Admin only)
     * @param {number} id - Booking ID
     * @param {string} status - New status (CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
     */
    updateStatus: async (id, status) => {
        const response = await api.patch(`/v1/bookings/${id}/status`, null, {
            params: { status }
        });
        return response.data;
    },

    // ========== RETURN ENDPOINTS ==========

    /**
     * Process vehicle return (Admin only)
     * @param {number} bookingId - Booking ID
     * @param {object} returnData - Return details
     */
    processReturn: async (bookingId, returnData) => {
        const response = await api.post(`/v1/bookings/${bookingId}/return`, returnData);
        return response.data;
    },

    /**
     * Get return details for a booking
     */
    getReturnDetails: async (bookingId) => {
        const response = await api.get(`/v1/bookings/${bookingId}/return`);
        return response.data;
    }
};

export default bookingService;
