package com.carrentalsystem.entity;

/**
 * Enum representing invoice payment status.
 */
public enum PaymentStatus {
    PENDING(1),
    PAID(2);

    private final int id;

    PaymentStatus(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static PaymentStatus fromId(Integer id) {
        if (id == null) {
            return null;
        }
        for (PaymentStatus status : values()) {
            if (status.id == id) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown payment status id: " + id);
    }
}
