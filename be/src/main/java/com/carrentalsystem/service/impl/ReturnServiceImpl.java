package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.returns.ReturnRequestDTO;
import com.carrentalsystem.dto.returns.ReturnResponseDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.repository.*;
import com.carrentalsystem.service.ReturnService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Implementation of ReturnService with complete return processing logic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnServiceImpl implements ReturnService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final PricingRepository pricingRepository;
    private final InspectionRepository inspectionRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional
    public ReturnResponseDTO processReturn(Long bookingId, ReturnRequestDTO request) {
        log.info("Processing return for booking ID: {}", bookingId);

        // 1. Find and validate booking
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        validateBookingForReturn(booking);

        // 2. Get vehicle
        VehicleEntity vehicle = booking.getVehicle();

        // 3. Create inspection record
        InspectionEntity inspection = createInspection(booking, request);
        InspectionEntity savedInspection = inspectionRepository.save(inspection);
        log.info("Inspection created with ID: {}", savedInspection.getId());

        // 4. Calculate fees
        LocalDateTime actualReturnDate = LocalDateTime.now();
        BigDecimal rentalFee = booking.getTotalAmount();

        // Calculate overtime
        int overtimeHours = calculateOvertimeHours(booking.getEndDate(), actualReturnDate);
        BigDecimal overtimeFeePerHour = getOvertimeFeePerHour(vehicle);
        BigDecimal overtimeFee = overtimeFeePerHour.multiply(BigDecimal.valueOf(overtimeHours));

        // Get damage and delivery fees from request
        BigDecimal damageFee = request.getDamageFee() != null ? request.getDamageFee() : BigDecimal.ZERO;
        BigDecimal deliveryFee = request.getDeliveryFee() != null ? request.getDeliveryFee() : BigDecimal.ZERO;

        // Calculate totals
        BigDecimal subtotal = rentalFee.add(overtimeFee).add(damageFee).add(deliveryFee);
        BigDecimal taxAmount = BigDecimal.ZERO; // Can be calculated as percentage if needed
        // Total amount logic can be enhanced with tax calculation
        BigDecimal totalAmount = subtotal.add(taxAmount);

        // 5. Generate invoice
        InvoiceEntity invoice = createInvoice(
                booking, savedInspection, actualReturnDate,
                rentalFee, overtimeHours, overtimeFee, overtimeFeePerHour,
                damageFee, deliveryFee, subtotal, taxAmount, totalAmount);
        InvoiceEntity savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice generated: {}", savedInvoice.getInvoiceNumber());

        // 6. Update booking status to COMPLETED
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);
        log.info("Booking {} marked as COMPLETED", booking.getBookingCode());

        // 7. Update vehicle status to AVAILABLE or MAINTENANCE
        if (Boolean.TRUE.equals(request.getHasDamage()) ||
                request.getExteriorCondition() == ConditionRating.DAMAGED ||
                request.getInteriorCondition() == ConditionRating.DAMAGED) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            log.info("Vehicle {} marked as MAINTENANCE due to reported damage", vehicle.getLicensePlate());
        } else {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            log.info("Vehicle {} marked as AVAILABLE", vehicle.getLicensePlate());
        }
        vehicleRepository.save(vehicle);

        // 8. Build and return response
        return buildReturnResponse(booking, vehicle, savedInspection, savedInvoice, overtimeFeePerHour);
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnResponseDTO getReturnByBookingId(Long bookingId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        InspectionEntity inspection = inspectionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection", "bookingId", bookingId));

        InvoiceEntity invoice = invoiceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "bookingId", bookingId));

        BigDecimal overtimeFeePerHour = getOvertimeFeePerHour(booking.getVehicle());

        return buildReturnResponse(booking, booking.getVehicle(), inspection, invoice, overtimeFeePerHour);
    }

    // ============== Private Helper Methods ==============

    private void validateBookingForReturn(BookingEntity booking) {
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Booking has already been completed");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot process return for a cancelled booking");
        }
        if (booking.getStatus() == BookingStatus.PENDING) {
            throw new IllegalArgumentException("Booking must be confirmed or in progress before return");
        }
        if (inspectionRepository.existsByBookingId(booking.getId())) {
            throw new IllegalArgumentException("Return has already been processed for this booking");
        }
    }

    private InspectionEntity createInspection(BookingEntity booking, ReturnRequestDTO request) {
        return InspectionEntity.builder()
                .booking(booking)
                .batteryLevel(request.getBatteryLevel())
                .odometer(request.getOdometer())
                .chargingCablePresent(request.getChargingCablePresent())
                .exteriorCondition(request.getExteriorCondition())
                .interiorCondition(request.getInteriorCondition())
                .hasDamage(request.getHasDamage())
                .damageDescription(request.getDamageDescription())
                .inspectedBy(request.getInspectedBy())
                .inspectionNotes(request.getInspectionNotes())
                .inspectedAt(LocalDateTime.now())
                .build();
    }

    private int calculateOvertimeHours(LocalDate scheduledEndDate, LocalDateTime actualReturnDate) {
        // Convert end date to end of day (rental should return by end of day)
        LocalDateTime scheduledEndDateTime = scheduledEndDate.atTime(23, 59, 59);

        if (actualReturnDate.isAfter(scheduledEndDateTime)) {
            long hoursLate = ChronoUnit.HOURS.between(scheduledEndDateTime, actualReturnDate);
            return (int) Math.max(0, hoursLate);
        }
        return 0;
    }

    private BigDecimal getOvertimeFeePerHour(VehicleEntity vehicle) {
        if (vehicle.getCategory() != null) {
            return pricingRepository.findCurrentPricingByCategory(vehicle.getCategory().getId())
                    .map(PricingEntity::getOvertimeFeePerHour)
                    .orElse(BigDecimal.valueOf(10.00));
        }
        return BigDecimal.valueOf(10.00); // Default overtime fee
    }

    private InvoiceEntity createInvoice(
            BookingEntity booking,
            InspectionEntity inspection,
            LocalDateTime actualReturnDate,
            BigDecimal rentalFee,
            int overtimeHours,
            BigDecimal overtimeFee,
            BigDecimal overtimeFeePerHour,
            BigDecimal damageFee,
            BigDecimal deliveryFee,
            BigDecimal subtotal,
            BigDecimal taxAmount,
            BigDecimal totalAmount) {
        return InvoiceEntity.builder()
                .invoiceNumber(generateInvoiceNumber())
                .booking(booking)
                .inspection(inspection)
                .rentalFee(rentalFee)
                .overtimeHours(overtimeHours)
                .overtimeFee(overtimeFee)
                .damageFee(damageFee)
                .deliveryFee(deliveryFee)
                .discountAmount(BigDecimal.ZERO)
                .taxAmount(taxAmount)
                .subtotal(subtotal)
                .totalAmount(totalAmount)
                .paymentStatus(PaymentStatus.PENDING)
                .actualReturnDate(actualReturnDate)
                .issuedAt(LocalDateTime.now())
                .dueDate(LocalDate.now().plusDays(7))
                .build();
    }

    private String generateInvoiceNumber() {
        // Format: INV-YYYYMMDD-XXXX
        String datePart = LocalDate.now().toString().replace("-", "");
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "INV-" + datePart + "-" + randomPart;
    }

    private ReturnResponseDTO buildReturnResponse(
            BookingEntity booking,
            VehicleEntity vehicle,
            InspectionEntity inspection,
            InvoiceEntity invoice,
            BigDecimal overtimeFeePerHour) {
        return ReturnResponseDTO.builder()
                // Booking info
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                // Vehicle info
                .vehicleId(vehicle.getId())
                .vehicleName(vehicle.getName())
                .vehicleLicensePlate(vehicle.getLicensePlate())
                // Customer info
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                // Rental period
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .actualReturnDate(invoice.getActualReturnDate())
                // Inspection details
                .inspectionId(inspection.getId())
                .batteryLevel(inspection.getBatteryLevel())
                .odometer(inspection.getOdometer())
                .chargingCablePresent(inspection.getChargingCablePresent())
                .exteriorCondition(inspection.getExteriorCondition())
                .interiorCondition(inspection.getInteriorCondition())
                .hasDamage(inspection.getHasDamage())
                .damageDescription(inspection.getDamageDescription())
                // Invoice details
                .invoiceId(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                // Fee breakdown
                .totalDays(booking.getTotalDays())
                .dailyRate(booking.getDailyRate())
                .rentalFee(invoice.getRentalFee())
                .overtimeHours(invoice.getOvertimeHours())
                .overtimeFeePerHour(overtimeFeePerHour)
                .overtimeFee(invoice.getOvertimeFee())
                .damageFee(invoice.getDamageFee())
                .deliveryFee(invoice.getDeliveryFee())
                .discountAmount(invoice.getDiscountAmount())
                .taxAmount(invoice.getTaxAmount())
                .subtotal(invoice.getSubtotal())
                .totalAmount(invoice.getTotalAmount())
                .paymentStatus(invoice.getPaymentStatus())
                .issuedAt(invoice.getIssuedAt())
                .build();
    }
}
