package com.carrentalsystem.entity;

/**
 * Enum representing the possible statuses of a vehicle in the fleet.
 */
public enum VehicleStatus {
    /**
     * Vehicle is available for rental
     */
    AVAILABLE,

    /**
     * Vehicle is currently rented
     */
    RENTED,

    /**
     * Vehicle is under maintenance
     */
    MAINTENANCE
}
