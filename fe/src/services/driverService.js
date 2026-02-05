import api from './api';

/**
 * Driver Service - API calls for driver dashboard
 */

export const getDriverStats = async () => {
    const response = await api.get('/v1/driver/stats');
    return response.data;
};

export const getMyTrips = async () => {
    const response = await api.get('/v1/driver/trips');
    return response.data;
};

export const getTripsByStatus = async (status) => {
    const response = await api.get(`/v1/driver/trips/status/${status}`);
    return response.data;
};

export const getTripDetail = async (tripId) => {
    const response = await api.get(`/v1/driver/trips/${tripId}`);
    return response.data;
};

export const acceptTrip = async (tripId) => {
    const response = await api.put(`/v1/driver/trips/${tripId}/accept`);
    return response.data;
};

export const startTrip = async (tripId) => {
    const response = await api.put(`/v1/driver/trips/${tripId}/start`);
    return response.data;
};

export const completeTrip = async (tripId) => {
    const response = await api.put(`/v1/driver/trips/${tripId}/complete`);
    return response.data;
};

export const declineTrip = async (tripId) => {
    const response = await api.put(`/v1/driver/trips/${tripId}/decline`);
    return response.data;
};

export const getEarnings = async () => {
    const response = await api.get('/v1/driver/earnings');
    return response.data;
};

export default {
    getDriverStats,
    getMyTrips,
    getTripsByStatus,
    getTripDetail,
    acceptTrip,
    startTrip,
    completeTrip,
    declineTrip,
    getEarnings
};
