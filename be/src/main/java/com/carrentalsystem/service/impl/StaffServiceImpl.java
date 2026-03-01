package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.dto.staff.InspectionRequestDTO;
import com.carrentalsystem.dto.staff.InspectionResponseDTO;
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
import java.util.Comparator;
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
        List<BookingEntity> staffTasks = bookingRepository.findByAssignedStaffIdWithDetails(staffId);
        List<BookingEntity> driverTasks = bookingRepository.findByDriverIdWithDetails(staffId);

        // Merge lists (avoid duplicates if same person is both staff and driver on same
        // booking, unlikely but possible)
        staffTasks.addAll(driverTasks);

        List<BookingEntity> distinctTasks = staffTasks.stream().distinct().collect(Collectors.toList());

        return distinctTasks.stream()
                .filter(task -> task.getStatus() != BookingStatus.CANCELLED && task.getStatus() != BookingStatus.COMPLETED)
                .sorted(Comparator.comparing(BookingEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getAssignedTaskDetail(Long bookingId, Long staffId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        validateInspectorAssignment(booking, staffId);
        return toResponseDTO(booking);
    }

    @Override
    public InspectionResponseDTO submitInspection(InspectionRequestDTO request, Long inspectorId) {
        log.info("Submitting inspection for booking {} type {}", request.getBookingId(), request.getType());

        BookingEntity booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));
        validateInspectorAssignment(booking, inspectorId);

        // Validate Status Flow
        if (request.getType() == InspectionType.PICKUP) {
            if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.ASSIGNED) {
                throw new IllegalStateException("Pickup inspection is only allowed for ASSIGNED or CONFIRMED bookings");
            }
        } else if (request.getType() == InspectionType.RETURN) {
            if (booking.getStatus() != BookingStatus.IN_PROGRESS && booking.getStatus() != BookingStatus.ONGOING) {
                throw new IllegalStateException("Return inspection is only allowed for IN_PROGRESS or ONGOING bookings");
            }
        }

        if (inspectionRepository.existsByBookingIdAndType(request.getBookingId(), request.getType())) {
            throw new IllegalStateException("This inspection type has already been submitted for the booking");
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
            if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.ASSIGNED) {
                booking.setStatus(BookingStatus.IN_PROGRESS);
                bookingRepository.save(booking);
            }
        } else if (request.getType() == InspectionType.RETURN) {
            if (booking.getStatus() == BookingStatus.IN_PROGRESS || booking.getStatus() == BookingStatus.ONGOING) {
                booking.setStatus(BookingStatus.COMPLETED);
                bookingRepository.save(booking);
            }
        }

        return toInspectionResponseDTO(savedInspection);
    }

    private void validateInspectorAssignment(BookingEntity booking, Long inspectorId) {
        boolean isAssignedStaff = inspectorId != null && inspectorId.equals(booking.getAssignedStaffId());
        boolean isAssignedDriver = inspectorId != null && inspectorId.equals(booking.getDriverId());
        if (!isAssignedStaff && !isAssignedDriver) {
            throw new IllegalStateException("You are not assigned to this booking");
        }
    }

    private BookingResponseDTO toResponseDTO(BookingEntity booking) {
        BookingResponseDTO dto = bookingMapper.toResponseDTO(booking);
        if (booking.getVehicle() != null
                && booking.getVehicle().getVehicleCategory() != null
                && booking.getVehicle().getVehicleCategory().getImages() != null
                && !booking.getVehicle().getVehicleCategory().getImages().isEmpty()) {
            dto.setVehicleImage(booking.getVehicle().getVehicleCategory().getImages().get(0).getImageUrl());
        }
        return dto;
    }

    private InspectionResponseDTO toInspectionResponseDTO(InspectionEntity inspection) {
        return InspectionResponseDTO.builder()
                .id(inspection.getId())
                .bookingId(inspection.getBooking() != null ? inspection.getBooking().getId() : null)
                .type(inspection.getType())
                .batteryLevel(inspection.getBatteryLevel())
                .odometer(inspection.getOdometer())
                .chargingCablePresent(inspection.getChargingCablePresent())
                .exteriorCondition(inspection.getExteriorCondition())
                .interiorCondition(inspection.getInteriorCondition())
                .hasDamage(inspection.getHasDamage())
                .damageDescription(inspection.getDamageDescription())
                .inspectionNotes(inspection.getInspectionNotes())
                .inspectedById(inspection.getInspectedById())
                .inspectedAt(inspection.getInspectedAt())
                .createdAt(inspection.getCreatedAt())
                .build();
    }
}
