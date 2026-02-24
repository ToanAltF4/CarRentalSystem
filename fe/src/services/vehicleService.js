import api from './api';

const vehicleService = {
    normalizeVehicle: (v) => {
        if (!v) return null;
        return {
            id: v.id,
            licensePlate: v.licensePlate || '',
            status: v.status || 'AVAILABLE',
            vin: v.vin || '',
            odometer: v.odometer || 0,
            currentBatteryPercent: v.currentBatteryPercent || 0,
            // Category info (denormalized from backend)
            categoryId: v.categoryId || v.vehicleCategoryId || null,
            categoryBrand: v.categoryBrand || v.brand || '',
            categoryName: v.categoryName || v.name || '',
            categoryModel: v.categoryModel || v.model || '',
            seats: v.seats || 0,
            batteryCapacityKwh: v.batteryCapacityKwh || 0,
            rangeKm: v.rangeKm || 0,
            chargingTimeHours: v.chargingTimeHours || 0,
            description: v.description || '',
            imageUrl: v.imageUrl || '',
            // Pricing
            dailyPrice: v.dailyPrice || v.dailyRate || 0,
            weeklyPrice: v.weeklyPrice || 0,
            monthlyPrice: v.monthlyPrice || 0,
            overtimeFeePerHour: v.overtimeFeePerHour || 0,
            // Legacy
            name: v.categoryName || v.name || '',
            brand: v.categoryBrand || v.brand || '',
            model: v.categoryModel || v.model || '',
            dailyRate: v.dailyPrice || v.dailyRate || 0,
            // Timestamps
            createdAt: v.createdAt || '',
            updatedAt: v.updatedAt || '',
        };
    },

    normalizeVehicleList: (list) => {
        if (!Array.isArray(list)) return [];
        return list.map(vehicleService.normalizeVehicle).filter(Boolean);
    },

    normalizeUnavailableDateRange: (range) => {
        if (!range) return null;
        return {
            startDate: range.startDate || '',
            endDate: range.endDate || '',
            status: range.status || '',
        };
    },

    normalizeUnavailableDateRangeList: (list) => {
        if (!Array.isArray(list)) return [];
        return list
            .map(vehicleService.normalizeUnavailableDateRange)
            .filter(Boolean);
    },

    getAll: async () => {
        const res = await api.get('/v1/vehicles');
        return vehicleService.normalizeVehicleList(res.data);
    },

    getById: async (id) => {
        const res = await api.get(`/v1/vehicles/${id}`);
        return vehicleService.normalizeVehicle(res.data);
    },

    search: async (keyword) => {
        const res = await api.get('/v1/vehicles/search', { params: { keyword } });
        return vehicleService.normalizeVehicleList(res.data);
    },

    getAvailable: async (startDate, endDate) => {
        const res = await api.get('/v1/vehicles/available', { params: { startDate, endDate } });
        return vehicleService.normalizeVehicleList(res.data);
    },

    getByCategory: async (categoryId) => {
        const res = await api.get(`/v1/vehicles/category/${categoryId}`);
        return vehicleService.normalizeVehicleList(res.data);
    },

    getUnavailableDates: async (vehicleId) => {
        const res = await api.get(`/v1/vehicles/${vehicleId}/unavailable-dates`);
        return vehicleService.normalizeUnavailableDateRangeList(res.data);
    },

    create: async (data) => {
        const payload = {
            vehicleCategoryId: data.vehicleCategoryId,
            licensePlate: data.licensePlate,
            vin: data.vin || null,
            odometer: data.odometer ? parseInt(data.odometer) : null,
            currentBatteryPercent: data.currentBatteryPercent ? parseInt(data.currentBatteryPercent) : null,
        };
        const res = await api.post('/v1/vehicles', payload);
        return vehicleService.normalizeVehicle(res.data);
    },

    update: async (id, data) => {
        const payload = {
            vehicleCategoryId: data.vehicleCategoryId,
            licensePlate: data.licensePlate,
            vin: data.vin || null,
            odometer: data.odometer ? parseInt(data.odometer) : null,
            currentBatteryPercent: data.currentBatteryPercent ? parseInt(data.currentBatteryPercent) : null,
        };
        const res = await api.put(`/v1/vehicles/${id}`, payload);
        return vehicleService.normalizeVehicle(res.data);
    },

    updateStatus: async (id, status) => {
        const res = await api.patch(`/v1/vehicles/${id}/status`, null, { params: { status } });
        return vehicleService.normalizeVehicle(res.data);
    },

    delete: async (id) => {
        return api.delete(`/v1/vehicles/${id}`);
    },

    mapToCarCard: (v) => {
        const normalized = vehicleService.normalizeVehicle(v);
        if (!normalized) return null;
        const baseName = `${normalized.categoryBrand} ${normalized.categoryName}`.trim();
        const modelName = (normalized.categoryModel || '').trim();
        const hasModelInBaseName =
            modelName &&
            baseName.toLowerCase().includes(modelName.toLowerCase());
        const displayName =
            modelName && !hasModelInBaseName
                ? `${baseName} - ${modelName}`
                : baseName || modelName || 'Unknown Vehicle';

        return {
            id: normalized.id,
            name: displayName,
            model: normalized.categoryModel,
            brand: normalized.categoryBrand,
            dailyRate: normalized.dailyPrice,
            imageUrl: normalized.imageUrl,
            seats: normalized.seats,
            range: normalized.rangeKm,
            status: normalized.status,
            licensePlate: normalized.licensePlate,
        };
    },
};

export default vehicleService;
