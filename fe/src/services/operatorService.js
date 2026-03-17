import api from './api';
import { cachedGet, invalidateCachedGet } from './requestCache';

/**
 * Service for Operator Role operations
 */
const OPERATOR_CACHE_PREFIX = 'operator:';
const OPERATOR_BOOKING_CACHE_PREFIX = 'operator:bookings:';
const OPERATOR_LICENSE_CACHE_PREFIX = 'operator:licenses:';
const BOOKING_CACHE_PREFIX = 'bookings:';
const USERS_CACHE_PREFIX = 'users:';

const getBookingCacheKey = (status, todayOnly) => {
    if (todayOnly) return `${OPERATOR_BOOKING_CACHE_PREFIX}today`;
    if (status && status !== 'ALL') {
        return `${OPERATOR_BOOKING_CACHE_PREFIX}status:${status}`;
    }
    return `${OPERATOR_BOOKING_CACHE_PREFIX}all`;
};

const operatorService = {
    // ==================== Dashboard Stats ====================
    getDashboardStats: async () => {
        return cachedGet(
            `${OPERATOR_CACHE_PREFIX}dashboard:stats`,
            async () => {
                const response = await api.get('/v1/operator/dashboard/stats');
                return response.data;
            },
            20_000
        );
    },

    // ==================== Booking Management ====================
    getAllBookings: async () => {
        return cachedGet(
            getBookingCacheKey('ALL', false),
            async () => {
                const response = await api.get('/v1/bookings');
                return response.data;
            },
            20_000
        );
    },

    getTodayBookings: async () => {
        return cachedGet(
            getBookingCacheKey('ALL', true),
            async () => {
                const response = await api.get('/v1/operator/bookings/today');
                return response.data;
            },
            10_000
        );
    },

    getConfirmedBookings: async () => {
        return cachedGet(
            `${OPERATOR_BOOKING_CACHE_PREFIX}confirmed`,
            async () => {
                const response = await api.get('/v1/operator/bookings/confirmed');
                return response.data;
            },
            20_000
        );
    },

    getBookingsByStatus: async (status) => {
        return cachedGet(
            getBookingCacheKey(status, false),
            async () => {
                const response = await api.get(`/v1/bookings/status/${status}`);
                return response.data;
            },
            20_000
        );
    },

    approveBooking: async (bookingId) => {
        const response = await api.post(`/v1/operator/bookings/${bookingId}/approve`);
        invalidateCachedGet(OPERATOR_BOOKING_CACHE_PREFIX);
        invalidateCachedGet(`${OPERATOR_CACHE_PREFIX}dashboard:`);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        return response.data;
    },

    rejectBooking: async (bookingId, reason) => {
        const response = await api.post(`/v1/operator/bookings/${bookingId}/reject`, { reason });
        invalidateCachedGet(OPERATOR_BOOKING_CACHE_PREFIX);
        invalidateCachedGet(`${OPERATOR_CACHE_PREFIX}dashboard:`);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        return response.data;
    },

    // ==================== Staff Assignment ====================
    getAvailableStaff: async () => {
        return cachedGet(
            `${OPERATOR_CACHE_PREFIX}staff:available`,
            async () => {
                const response = await api.get('/v1/operator/staff/available');
                return response.data;
            },
            20_000
        );
    },

    getAvailableDrivers: async () => {
        return cachedGet(
            `${OPERATOR_CACHE_PREFIX}drivers:available`,
            async () => {
                const response = await api.get('/v1/operator/drivers/available');
                return response.data;
            },
            20_000
        );
    },

    assignStaff: async (bookingId, staffId, driverId) => {
        const response = await api.post(`/v1/operator/bookings/${bookingId}/assign`, {
            bookingId, // Included for DTO validation
            staffId,
            driverId
        });
        invalidateCachedGet(OPERATOR_BOOKING_CACHE_PREFIX);
        invalidateCachedGet(`${OPERATOR_CACHE_PREFIX}dashboard:`);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(`${OPERATOR_CACHE_PREFIX}staff:`);
        invalidateCachedGet(`${OPERATOR_CACHE_PREFIX}drivers:`);
        return response.data;
    },

    unassignStaff: async (bookingId) => {
        const response = await api.delete(`/v1/operator/bookings/${bookingId}/assign`);
        invalidateCachedGet(OPERATOR_BOOKING_CACHE_PREFIX);
        invalidateCachedGet(`${OPERATOR_CACHE_PREFIX}dashboard:`);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(`${OPERATOR_CACHE_PREFIX}staff:`);
        invalidateCachedGet(`${OPERATOR_CACHE_PREFIX}drivers:`);
        return response.data;
    },

    getStaffAssignedBookings: async (staffId) => {
        return cachedGet(
            `${OPERATOR_CACHE_PREFIX}staff:${staffId}:bookings`,
            async () => {
                const response = await api.get(`/v1/operator/staff/${staffId}/bookings`);
                return response.data;
            },
            15_000
        );
    },

    // ==================== License Verification ====================
    getPendingLicenses: async () => {
        return cachedGet(
            `${OPERATOR_LICENSE_CACHE_PREFIX}pending`,
            async () => {
                const response = await api.get('/v1/operator/licenses/pending');
                return response.data;
            },
            15_000
        );
    },

    approveLicense: async (userId) => {
        const response = await api.post(`/v1/operator/users/${userId}/approve-license`);
        invalidateCachedGet(OPERATOR_LICENSE_CACHE_PREFIX);
        invalidateCachedGet(USERS_CACHE_PREFIX);
        return response.data;
    },

    rejectLicense: async (userId, reason) => {
        const response = await api.post(`/v1/operator/users/${userId}/reject-license`, { reason });
        invalidateCachedGet(OPERATOR_LICENSE_CACHE_PREFIX);
        invalidateCachedGet(USERS_CACHE_PREFIX);
        return response.data;
    },

    getBookingsCacheKey: (status, todayOnly) => getBookingCacheKey(status, todayOnly),
};

export default operatorService;
