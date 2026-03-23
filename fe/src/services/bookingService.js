import api from './api';
import { cachedGet, invalidateCachedGet } from './requestCache';

const BOOKING_CACHE_PREFIX = 'bookings:';
const DASHBOARD_CACHE_PREFIX = 'dashboard:';
const VEHICLE_CACHE_PREFIX = 'vehicles:';

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
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(DASHBOARD_CACHE_PREFIX);
        invalidateCachedGet(VEHICLE_CACHE_PREFIX);
        return response.data;
    },

    // ========== BOOKING WIZARD OPTIONS ==========

    /**
     * Get all rental types (SELF_DRIVE, WITH_DRIVER)
     */
    getRentalTypes: async () => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}rental-types`,
            async () => {
                const response = await api.get('/v1/booking-options/rental-types');
                return response.data;
            },
            300_000
        );
    },

    /**
     * Get all pickup methods (STORE, DELIVERY)
     */
    getPickupMethods: async () => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}pickup-methods`,
            async () => {
                const response = await api.get('/v1/booking-options/pickup-methods');
                return response.data;
            },
            300_000
        );
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
     * Calculate delivery fee based on address and optional real route distance.
     * @param {string} deliveryAddress - Delivery address
     * @param {number|null} [distanceKm] - Route distance in km from OSRM
     * @param {boolean} [withDriver] - If true, apply driver-aware pricing (free within 5km)
     */
    calculateDeliveryFee: async (deliveryAddress, distanceKm = null, withDriver = false) => {
        const payload = { deliveryAddress, withDriver };
        if (typeof distanceKm === 'number' && Number.isFinite(distanceKm) && distanceKm > 0) {
            payload.distanceKm = distanceKm;
        }
        const response = await api.post('/v1/booking-options/calculate-delivery-fee', payload);
        return response.data;
    },

    /**
     * Get current pricing info (driver daily fee, delivery base fee, etc.)
     */
    getPricingInfo: async () => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}pricing-info`,
            async () => {
                const response = await api.get('/v1/booking-options/pricing-info');
                return response.data;
            },
            60_000
        );
    },

    /**
     * Get booking by ID
     */
    getById: async (id) => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}by-id:${id}`,
            async () => {
                const response = await api.get(`/v1/bookings/${id}`);
                return response.data;
            },
            15_000
        );
    },

    /**
     * Get booking by booking code
     */
    getByCode: async (code) => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}by-code:${code}`,
            async () => {
                const response = await api.get(`/v1/bookings/code/${code}`);
                return response.data;
            },
            15_000
        );
    },

    /**
     * Get bookings by customer email
     */
    getByEmail: async (email) => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}by-email:${email}`,
            async () => {
                const response = await api.get('/v1/bookings/customer', { params: { email } });
                return response.data;
            },
            15_000
        );
    },

    /**
     * Cancel a booking
     */
    cancel: async (id) => {
        const response = await api.post(`/v1/bookings/${id}/cancel`);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(DASHBOARD_CACHE_PREFIX);
        invalidateCachedGet(VEHICLE_CACHE_PREFIX);
        return response.data;
    },

    // ========== ADMIN ENDPOINTS ==========

    /**
     * Get all bookings (Admin only)
     */
    getAll: async () => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}all`,
            async () => {
                const response = await api.get('/v1/bookings');
                return response.data;
            },
            15_000
        );
    },

    /**
     * Get bookings by status
     */
    getByStatus: async (status) => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}by-status:${status}`,
            async () => {
                const response = await api.get(`/v1/bookings/status/${status}`);
                return response.data;
            },
            15_000
        );
    },

    /**
     * Get bookings by vehicle ID
     */
    getByVehicle: async (vehicleId) => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}by-vehicle:${vehicleId}`,
            async () => {
                const response = await api.get(`/v1/bookings/vehicle/${vehicleId}`);
                return response.data;
            },
            15_000
        );
    },

    /**
     * Get upcoming bookings
     */
    getUpcoming: async () => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}upcoming`,
            async () => {
                const response = await api.get('/v1/bookings/upcoming');
                return response.data;
            },
            15_000
        );
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
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(DASHBOARD_CACHE_PREFIX);
        invalidateCachedGet(VEHICLE_CACHE_PREFIX);
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
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(DASHBOARD_CACHE_PREFIX);
        invalidateCachedGet(VEHICLE_CACHE_PREFIX);
        return response.data;
    },

    /**
     * Get return details for a booking
     */
    getReturnDetails: async (bookingId) => {
        return cachedGet(
            `${BOOKING_CACHE_PREFIX}return-details:${bookingId}`,
            async () => {
                const response = await api.get(`/v1/bookings/${bookingId}/return`);
                return response.data;
            },
            15_000
        );
    }
};

export default bookingService;
