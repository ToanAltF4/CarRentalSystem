import api from './api';

const normalizeVehicle = (vehicle) => {
    if (!vehicle) return vehicle;

    const imageUrl =
        vehicle.imageUrl ||
        vehicle.image_url ||
        vehicle.image ||
        vehicle.vehicleImage ||
        vehicle.vehicleImageUrl ||
        vehicle.vehicle_image ||
        null;

    return {
        ...vehicle,
        id: vehicle.id ?? vehicle.vehicleId ?? vehicle.vehicle_id,
        name: vehicle.name || vehicle.vehicleName || vehicle.vehicle_name,
        model: vehicle.model || vehicle.vehicleModel || vehicle.vehicle_model,
        brand: vehicle.brand || vehicle.vehicleBrand || vehicle.vehicle_brand,
        licensePlate: vehicle.licensePlate || vehicle.vehicleLicensePlate || vehicle.license_plate,
        batteryCapacityKwh: vehicle.batteryCapacityKwh ?? vehicle.battery_capacity_kwh,
        rangeKm: vehicle.rangeKm ?? vehicle.range_km,
        chargingTimeHours: vehicle.chargingTimeHours ?? vehicle.charging_time_hours,
        dailyRate: vehicle.dailyRate ?? vehicle.daily_rate ?? vehicle.price_per_day ?? vehicle.price,
        status: vehicle.status || vehicle.vehicle_status,
        imageUrl,
        seats: vehicle.seats ?? vehicle.seat_count,
        description: vehicle.description || vehicle.desc,
        categoryName: vehicle.categoryName || vehicle.category_name,
        overtimeFeePerHour: vehicle.overtimeFeePerHour ?? vehicle.overtime_fee_per_hour,
        createdAt: vehicle.createdAt || vehicle.created_at,
        updatedAt: vehicle.updatedAt || vehicle.updated_at
    };
};

const normalizeVehicleList = (vehicles) => {
    if (!Array.isArray(vehicles)) return [];
    return vehicles.map(normalizeVehicle);
};

const vehicleService = {
    getAll: async () => {
        const response = await api.get('/v1/vehicles');
        return normalizeVehicleList(response.data);
    },

    getModels: async () => {
        const response = await api.get('/v1/vehicles/models');
        // Models come as DTOs, we might need to normalize them or they are already good.
        // The DTO structure is similar to VehicleEntity but slightly different.
        // Let's assume response.data is good or apply minimal normalization if needed.
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/v1/vehicles/${id}`);
        return normalizeVehicle(response.data);
    },

    search: async (keyword) => {
        const response = await api.get('/v1/vehicles/search', { params: { keyword } });
        return normalizeVehicleList(response.data);
    },

    getAvailable: async (startDate, endDate) => {
        const response = await api.get('/v1/vehicles/available', {
            params: { startDate, endDate }
        });
        return normalizeVehicleList(response.data);
    },

    getBrands: async () => {
        const response = await api.get('/v1/vehicles/brands');
        return response.data;
    },

    // Admin Methods
    create: async (vehicleData) => {
        const response = await api.post('/v1/vehicles', vehicleData);
        return normalizeVehicle(response.data);
    },

    update: async (id, vehicleData) => {
        const response = await api.put(`/v1/vehicles/${id}`, vehicleData);
        return normalizeVehicle(response.data);
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/v1/vehicles/${id}/status`, null, { params: { status } });
        return normalizeVehicle(response.data);
    },

    delete: async (id) => {
        await api.delete(`/v1/vehicles/${id}`);
    },

    // Helper to map backend DTO to Frontend CarCard format
    mapToCarCard: (vehicle) => {
        const normalized = normalizeVehicle(vehicle);
        return {
            ...normalized,
            id: normalized?.id,
            name: normalized?.name,
            brand: normalized?.brand || 'EV',
            year: '2024',
            image: normalized?.imageUrl || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000',
            price: normalized?.dailyRate,
            rating: 5.0,
            range: normalized?.rangeKm ?? 400,
            isNew: true
        };
    }
};

export default vehicleService;
