package com.carrentalsystem.entity;

/**
 * Enum representing the possible statuses of a vehicle in the fleet.
 */
public enum VehicleStatus {
    /**
     * Vehicle is available for rental
     */
    AVAILABLE(1),

    /**
     * Vehicle is under maintenance
     */
    MAINTENANCE(2),

    /**
     * Vehicle is inactive (temporarily or permanently out of service)
     */
    INACTIVE(3);

    private final int id;

    VehicleStatus(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static VehicleStatus fromId(Integer id) {
        if (id == null) {
            return null;
        }
        for (VehicleStatus status : values()) {
            if (status.id == id) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown vehicle status id: " + id);
    }
}
