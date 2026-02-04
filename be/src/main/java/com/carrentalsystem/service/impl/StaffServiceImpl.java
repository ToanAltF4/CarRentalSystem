package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.dto.staff.InspectionRequestDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.mapper.BookingMapper;
import com.carrentalsystem.repository.BookingRepository;
import com.carrentalsystem.repository.InspectionRepository;
import com.carrentalsystem.service.StaffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StaffServiceImpl implements StaffService {

    private final BookingRepository bookingRepository;
    private final InspectionRepository inspectionRepository;
    private final BookingMapper bookingMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAssignedTasks(Long staffId) {
        log.debug("Fetching assigned tasks for staff ID: {}", staffId);

        // Find bookings assigned to staff or where user is the driver
        List<BookingEntity> staffTasks = bookingRepository.findByAssignedStaffId(staffId);
        List<BookingEntity> driverTasks = bookingRepository.findByDriverId(staffId);

        // Merge lists (avoid duplicates if same person is both staff and driver on same
        // booking, unlikely but possible)
        staffTasks.addAll(driverTasks);

        List<BookingEntity> distinctTasks = staffTasks.stream().distinct().collect(Collectors.toList());

        return distinctTasks.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InspectionEntity submitInspection(InspectionRequestDTO request, Long inspectorId) {
        log.info("Submitting inspection for booking {} type {}", request.getBookingId(), request.getType());

        BookingEntity booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        // Validate Status Flow
        if (request.getType() == InspectionType.PICKUP) {
            if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.IN_PROGRESS) {
                // Allow re-inspection if IN_PROGRESS? Or strict check?
                // Usually pickup happens when CONFIRMED.
            }
        } else if (request.getType() == InspectionType.RETURN) {
            // Return happens when IN_PROGRESS
            // If already COMPLETED, maybe amending?
        }

        InspectionEntity inspection = InspectionEntity.builder()
                .booking(booking)
                .type(request.getType())
                .batteryLevel(request.getBatteryLevel())
                .odometer(request.getOdometer())
                .chargingCablePresent(request.getChargingCablePresent())
                .exteriorCondition(request.getExteriorCondition())
                .interiorCondition(request.getInteriorCondition())
                .hasDamage(request.getHasDamage())
                .damageDescription(request.getDamageDescription())
                .damagePhotos(request.getDamagePhotos())
                .inspectedById(inspectorId)
                .inspectionNotes(request.getInspectionNotes())
                .inspectedAt(LocalDateTime.now())
                .build();

        InspectionEntity savedInspection = inspectionRepository.save(inspection);

        // Update Booking Status
        if (request.getType() == InspectionType.PICKUP) {
            if (booking.getStatus() == BookingStatus.CONFIRMED) {
                booking.setStatus(BookingStatus.IN_PROGRESS);
                bookingRepository.save(booking);
            }
        } else if (request.getType() == InspectionType.RETURN) {
            if (booking.getStatus() == BookingStatus.IN_PROGRESS) {
                booking.setStatus(BookingStatus.COMPLETED);
                // Can also update vehicle mileage/fuel/status here
                if (booking.getVehicle() != null) {
                    booking.getVehicle().setStatus(VehicleStatus.AVAILABLE); // Make vehicle available again
                    // Also update mileage/battery if VehicleEntity supports it?
                    // ignoring for now
                }
                bookingRepository.save(booking);
            }
        }

        return savedInspection;
    }
}
