import api from './api';

const vehicleService = {
    getAll: async () => {
        const response = await api.get('/v1/vehicles');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/v1/vehicles/${id}`);
        return response.data;
    },

    search: async (keyword) => {
        const response = await api.get('/v1/vehicles/search', { params: { keyword } });
        return response.data;
    },

    getAvailable: async (startDate, endDate) => {
        const response = await api.get('/v1/vehicles/available', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getBrands: async () => {
        const response = await api.get('/v1/vehicles/brands');
        return response.data;
    },

    // Admin Methods
    create: async (vehicleData) => {
        const response = await api.post('/v1/vehicles', vehicleData);
        return response.data;
    },

    update: async (id, vehicleData) => {
        const response = await api.put(`/v1/vehicles/${id}`, vehicleData);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/v1/vehicles/${id}/status`, null, { params: { status } });
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/v1/vehicles/${id}`);
    },

    // Helper to map backend DTO to Frontend CarCard format
    mapToCarCard: (vehicle) => ({
        id: vehicle.id,
        name: vehicle.name,
        brand: vehicle.brand || 'EV',
        year: '2024',
        image: vehicle.imageUrl || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000',
        price: vehicle.dailyRate,
        rating: 5.0,
        range: vehicle.rangeKm || 400,
        isNew: true
    })
};

export default vehicleService;
