package com.carrentalsystem.service;

import com.carrentalsystem.dto.returns.ReturnRequestDTO;
import com.carrentalsystem.dto.returns.ReturnResponseDTO;

/**
 * Service interface for vehicle return operations.
 */
public interface ReturnService {

    /**
     * Process vehicle return with inspection and invoice generation.
     * 
     * @param bookingId The booking ID to process return for
     * @param request   The return request data (inspection + fees)
     * @return ReturnResponseDTO with inspection and invoice details
     */
    ReturnResponseDTO processReturn(Long bookingId, ReturnRequestDTO request);

    /**
     * Get return details by booking ID.
     */
    ReturnResponseDTO getReturnByBookingId(Long bookingId);
}
