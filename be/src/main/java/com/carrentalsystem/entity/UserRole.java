package com.carrentalsystem.entity;

/**
 * Enum representing user roles in the EV Fleet system.
 * Used for authorization and access control.
 */
public enum UserRole {
    CUSTOMER, // Regular customers who rent vehicles
    TECHNICAL_STAFF, // Technical staff for vehicle maintenance
    MANAGER, // Fleet managers
    ADMIN // System administrators
}
