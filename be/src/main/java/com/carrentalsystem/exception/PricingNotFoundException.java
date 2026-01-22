package com.carrentalsystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when pricing is not found for a vehicle category.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class PricingNotFoundException extends RuntimeException {

    public PricingNotFoundException(String message) {
        super(message);
    }

    public PricingNotFoundException(Long categoryId) {
        super(String.format("No active pricing found for vehicle category ID: %d", categoryId));
    }
}
