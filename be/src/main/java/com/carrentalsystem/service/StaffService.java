package com.carrentalsystem.service;

import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.dto.staff.InspectionRequestDTO;
import com.carrentalsystem.entity.InspectionEntity;

import java.util.List;

public interface StaffService {

    /**
     * Get bookings assigned to a staff member.
     * 
     * @param staffId User ID of the staff
     * @return List of bookings
     */
    List<BookingResponseDTO> getAssignedTasks(Long staffId);

    /**
     * Submit an inspection report (Check-in or Check-out).
     * 
     * @param request     Inspection data
     * @param inspectorId User ID of the staff performing inspection
     * @return Created inspection entity
     */
    InspectionEntity submitInspection(InspectionRequestDTO request, Long inspectorId);
}
