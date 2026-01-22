package com.carrentalsystem.entity;

/**
 * Enum representing booking status flow.
 */
public enum BookingStatus {
    /**
     * Initial status when booking is created
     */
    PENDING,

    /**
     * Booking has been confirmed/approved
     */
    CONFIRMED,

    /**
     * Rental is currently in progress
     */
    IN_PROGRESS,

    /**
     * Rental completed, vehicle returned
     */
    COMPLETED,

    /**
     * Booking was cancelled
     */
    CANCELLED
}
