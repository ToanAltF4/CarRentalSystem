package com.carrentalsystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a vehicle is not available for booking.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class VehicleNotAvailableException extends RuntimeException {

    public VehicleNotAvailableException(String message) {
        super(message);
    }

    public VehicleNotAvailableException(Long vehicleId, String reason) {
        super(String.format("Vehicle ID %d is not available: %s", vehicleId, reason));
    }
}
