import api from './api';
import { cachedGet, invalidateCachedGet } from './requestCache';

const VEHICLE_CACHE_PREFIX = 'vehicles:';
const CATEGORY_CACHE_PREFIX = 'vehicle-categories:';
const BOOKING_CACHE_PREFIX = 'bookings:';
const DASHBOARD_CACHE_PREFIX = 'dashboard:';

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
        return cachedGet(
            `${VEHICLE_CACHE_PREFIX}all`,
            async () => {
                const res = await api.get('/v1/vehicles');
                return vehicleService.normalizeVehicleList(res.data);
            },
            30_000
        );
    },

    getById: async (id) => {
        return cachedGet(
            `${VEHICLE_CACHE_PREFIX}by-id:${id}`,
            async () => {
                const res = await api.get(`/v1/vehicles/${id}`);
                return vehicleService.normalizeVehicle(res.data);
            },
            30_000
        );
    },

    search: async (keyword) => {
        const normalizedKeyword = (keyword || '').trim().toLowerCase();
        return cachedGet(
            `${VEHICLE_CACHE_PREFIX}search:${normalizedKeyword}`,
            async () => {
                const res = await api.get('/v1/vehicles/search', { params: { keyword } });
                return vehicleService.normalizeVehicleList(res.data);
            },
            15_000
        );
    },

    getAvailable: async (startDate, endDate) => {
        const key = `${VEHICLE_CACHE_PREFIX}available:${startDate || ''}:${endDate || ''}`;
        return cachedGet(
            key,
            async () => {
                const res = await api.get('/v1/vehicles/available', { params: { startDate, endDate } });
                return vehicleService.normalizeVehicleList(res.data);
            },
            15_000
        );
    },

    getByCategory: async (categoryId) => {
        return cachedGet(
            `${VEHICLE_CACHE_PREFIX}by-category:${categoryId}`,
            async () => {
                const res = await api.get(`/v1/vehicles/category/${categoryId}`);
                return vehicleService.normalizeVehicleList(res.data);
            },
            30_000
        );
    },

    getUnavailableDates: async (vehicleId) => {
        return cachedGet(
            `${VEHICLE_CACHE_PREFIX}unavailable-dates:${vehicleId}`,
            async () => {
                const res = await api.get(`/v1/vehicles/${vehicleId}/unavailable-dates`);
                return vehicleService.normalizeUnavailableDateRangeList(res.data);
            },
            10_000
        );
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
        invalidateCachedGet(VEHICLE_CACHE_PREFIX);
        invalidateCachedGet(CATEGORY_CACHE_PREFIX);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(DASHBOARD_CACHE_PREFIX);
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
        invalidateCachedGet(VEHICLE_CACHE_PREFIX);
        invalidateCachedGet(CATEGORY_CACHE_PREFIX);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(DASHBOARD_CACHE_PREFIX);
        return vehicleService.normalizeVehicle(res.data);
    },

    updateStatus: async (id, status) => {
        const res = await api.patch(`/v1/vehicles/${id}/status`, null, { params: { status } });
        invalidateCachedGet(VEHICLE_CACHE_PREFIX);
        invalidateCachedGet(CATEGORY_CACHE_PREFIX);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(DASHBOARD_CACHE_PREFIX);
        return vehicleService.normalizeVehicle(res.data);
    },

    delete: async (id) => {
        const res = await api.delete(`/v1/vehicles/${id}`);
        invalidateCachedGet(VEHICLE_CACHE_PREFIX);
        invalidateCachedGet(CATEGORY_CACHE_PREFIX);
        invalidateCachedGet(BOOKING_CACHE_PREFIX);
        invalidateCachedGet(DASHBOARD_CACHE_PREFIX);
        return res;
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
