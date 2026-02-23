import api from './api';

const vehicleCategoryService = {
    getAll: async () => {
        const res = await api.get('/v1/vehicle-categories');
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/v1/vehicle-categories/${id}`);
        return res.data;
    },

    getBrands: async () => {
        const res = await api.get('/v1/vehicle-categories/brands');
        return res.data;
    },

    create: async (data) => {
        const res = await api.post('/v1/vehicle-categories', data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await api.put(`/v1/vehicle-categories/${id}`, data);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/v1/vehicle-categories/${id}`);
        return res.data;
    },

    normalizeCategory: (cat) => {
        if (!cat) return null;
        return {
            id: cat.id,
            brand: cat.brand || '',
            name: cat.name || '',
            model: cat.model || '',
            seats: cat.seats || 0,
            batteryCapacityKwh: cat.batteryCapacityKwh || 0,
            rangeKm: cat.rangeKm || 0,
            chargingTimeHours: cat.chargingTimeHours || 0,
            description: cat.description || '',
            imageUrls: cat.imageUrls || [],
            primaryImageUrl: cat.primaryImageUrl || (cat.imageUrls && cat.imageUrls[0]) || '',
            dailyPrice: cat.dailyPrice || 0,
            weeklyPrice: cat.weeklyPrice || 0,
            monthlyPrice: cat.monthlyPrice || 0,
            overtimeFeePerHour: cat.overtimeFeePerHour || 0,
            vehicleCount: cat.vehicleCount || 0,
            availableCount: cat.availableCount || 0,
            createdAt: cat.createdAt || '',
        };
    },
};

export default vehicleCategoryService;
