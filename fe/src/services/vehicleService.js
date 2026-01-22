import api from './api';

const vehicleService = {
    getAll: async () => {
        const response = await api.get('/vehicles');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/vehicles/${id}`);
        return response.data;
    },

    // Helper to map backend DTO to Frontend CarCard format
    mapToCarCard: (vehicle) => ({
        id: vehicle.id,
        name: vehicle.name,
        brand: vehicle.brand || 'EV',
        year: '2024', // Default for now
        image: vehicle.imageUrl || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000', // Fallback
        price: vehicle.dailyRate,
        rating: 5.0, // Default
        range: vehicle.rangeKm || 400,
        isNew: true
    }),

    delete: async (id) => {
        await api.delete(`/vehicles/${id}`);
    }
};

export default vehicleService;
