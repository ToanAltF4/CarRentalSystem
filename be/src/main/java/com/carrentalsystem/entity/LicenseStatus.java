package com.carrentalsystem.entity;

/**
 * Enum representing driver license status in the lookup table.
 */
public enum LicenseStatus {
    PENDING(1),
    APPROVED(2),
    REJECTED(3);

    private final int id;

    LicenseStatus(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static LicenseStatus fromId(Integer id) {
        if (id == null) {
            return null;
        }
        for (LicenseStatus status : values()) {
            if (status.id == id) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown license status id: " + id);
    }
}
