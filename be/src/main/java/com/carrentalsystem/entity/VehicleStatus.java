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
     * Vehicle is currently rented
     */
    RENTED(2);

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
