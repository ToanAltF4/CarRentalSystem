package com.carrentalsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic API response wrapper for consistent response structure.
 * 
 * @param <T> The type of data in the response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaseResponse<T> {
    
    /**
     * Response message (e.g., "Success", "User registered successfully")
     */
    private String message;
    
    /**
     * Response data (can be any type: String, Object, List, etc.)
     */
    private T data;
    
    /**
     * Convenience method to create a success response with message only
     */
    public static <T> BaseResponse<T> success(String message) {
        return BaseResponse.<T>builder()
                .message(message)
                .build();
    }
    
    /**
     * Convenience method to create a success response with data only
     */
    public static <T> BaseResponse<T> success(T data) {
        return BaseResponse.<T>builder()
                .data(data)
                .build();
    }
    
    /**
     * Convenience method to create a success response with both message and data
     */
    public static <T> BaseResponse<T> success(String message, T data) {
        return BaseResponse.<T>builder()
                .message(message)
                .data(data)
                .build();
    }
}
