package com.carrentalsystem.entity;

/**
 * Enum representing booking status flow.
 */
public enum BookingStatus {
    /**
     * Initial status when booking is created
     */
    PENDING(1),

    /**
     * Booking has been confirmed/approved
     */
    CONFIRMED(2),

    /**
     * Rental is currently in progress
     */
    IN_PROGRESS(3),

    /**
     * Rental completed, vehicle returned
     */
    COMPLETED(4),

    /**
     * Booking was cancelled
     */
    CANCELLED(5);

    private final int id;

    BookingStatus(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static BookingStatus fromId(Integer id) {
        if (id == null) {
            return null;
        }
        for (BookingStatus status : values()) {
            if (status.id == id) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown booking status id: " + id);
    }
}
