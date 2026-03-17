package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.returns.ReturnRequestDTO;
import com.carrentalsystem.dto.returns.ReturnResponseDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.repository.*;
import com.carrentalsystem.service.ReturnService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of ReturnService with complete return processing logic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnServiceImpl implements ReturnService {

    private final BookingRepository bookingRepository;
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

        // 4. Calculate fees (final invoice collects only damage fee; rental paid earlier)
        LocalDateTime actualReturnDate = LocalDateTime.now();
        BigDecimal rentalFee = BigDecimal.ZERO;
        BigDecimal driverFee = BigDecimal.ZERO;
        BigDecimal deliveryFee = BigDecimal.ZERO;

        // Final settlement only charges damage fee (if any)
        boolean hasDamage = resolveHasDamage(request);
        BigDecimal damageFee = hasDamage ? nvl(request.getDamageFee()) : BigDecimal.ZERO;
        int overtimeHours = 0;
        BigDecimal overtimeFeePerHour = BigDecimal.ZERO;
        BigDecimal overtimeFee = BigDecimal.ZERO;
        BigDecimal totalDeliveryFee = BigDecimal.ZERO;

        // Calculate totals (damage fee only)
        BigDecimal subtotal = damageFee;
        BigDecimal taxAmount = BigDecimal.ZERO; // Can be calculated as percentage if needed
        // Total amount logic can be enhanced with tax calculation
        BigDecimal totalAmount = subtotal.add(taxAmount);

        // 5. Generate or update invoice
        InvoiceEntity existingInvoice = invoiceRepository.findByBookingId(bookingId).orElse(null);
        InvoiceEntity invoice;
        if (existingInvoice != null) {
            log.info("Existing invoice found for booking {}, updating...", bookingId);
            existingInvoice.setInspection(savedInspection);
            existingInvoice.setRentalFee(rentalFee);
            existingInvoice.setDriverFee(driverFee);
            existingInvoice.setOvertimeHours(overtimeHours);
            existingInvoice.setOvertimeFee(overtimeFee);
            existingInvoice.setDamageFee(damageFee);
            existingInvoice.setDeliveryFee(totalDeliveryFee);
            existingInvoice.setDiscountAmount(BigDecimal.ZERO);
            existingInvoice.setTaxAmount(taxAmount);
            existingInvoice.setSubtotal(subtotal);
            existingInvoice.setTotalAmount(totalAmount);
            existingInvoice.setPaymentStatus(PaymentStatus.PENDING);
            existingInvoice.setActualReturnDate(actualReturnDate);
            existingInvoice.setIssuedAt(LocalDateTime.now());
            existingInvoice.setDueDate(LocalDate.now().plusDays(7));
            invoice = existingInvoice;
        } else {
            invoice = createInvoice(
                    booking, savedInspection, actualReturnDate,
                    rentalFee, driverFee, overtimeHours, overtimeFee,
                    damageFee, totalDeliveryFee, subtotal, taxAmount, totalAmount);
        }
        InvoiceEntity savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice generated: {}", savedInvoice.getInvoiceNumber());

        // 6. Mark booking as returned and waiting for final settlement.
        booking.setStatus(BookingStatus.RETURN_PENDING_PAYMENT);
        bookingRepository.save(booking);
        log.info("Booking {} marked as RETURN_PENDING_PAYMENT", booking.getBookingCode());

        // 7. Build and return response
        return buildReturnResponse(booking, vehicle, savedInspection, savedInvoice, overtimeFeePerHour);
    }

    @Override
    @Transactional
    public ReturnResponseDTO getReturnByBookingId(Long bookingId, String requesterEmail, boolean privileged) {
        BookingEntity booking = bookingRepository.findByIdWithVehicleCategory(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!privileged) {
            if (requesterEmail == null || booking.getCustomerEmail() == null
                    || !booking.getCustomerEmail().equalsIgnoreCase(requesterEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You are not allowed to view this return invoice");
            }
        }

        InspectionEntity inspection = inspectionRepository.findByBookingIdAndType(bookingId, InspectionType.RETURN)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection", "bookingId", bookingId));

        InvoiceEntity invoice = invoiceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "bookingId", bookingId));

        // Ensure final invoice only charges damage fee when payment is still pending
        if (invoice.getPaymentStatus() == PaymentStatus.PENDING) {
            BigDecimal damageFee = nvl(invoice.getDamageFee());
            if (invoice.getTotalAmount() == null || invoice.getTotalAmount().compareTo(damageFee) != 0) {
                invoice.setRentalFee(BigDecimal.ZERO);
                invoice.setDriverFee(BigDecimal.ZERO);
                invoice.setDeliveryFee(BigDecimal.ZERO);
                invoice.setTotalAmount(damageFee);
                invoiceRepository.save(invoice);
            }
        }

        Integer overtimeHours = invoice.getOvertimeHours();
        BigDecimal overtimeFeePerHour = (overtimeHours != null && overtimeHours > 0)
                ? getOvertimeFeePerHour(booking.getVehicle())
                : BigDecimal.ZERO;

        return buildReturnResponse(booking, booking.getVehicle(), inspection, invoice, overtimeFeePerHour);
    }

    // ============== Private Helper Methods ==============

    private void validateBookingForReturn(BookingEntity booking) {
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Booking has already been completed");
        }
        if (booking.getStatus() == BookingStatus.RETURN_PENDING_PAYMENT) {
            throw new IllegalArgumentException("Booking return has already been processed and is awaiting payment");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot process return for a cancelled booking");
        }
        if (booking.getStatus() != BookingStatus.IN_PROGRESS && booking.getStatus() != BookingStatus.ONGOING) {
            throw new IllegalArgumentException("Booking must be in progress before return");
        }
        if (inspectionRepository.existsByBookingIdAndType(booking.getId(), InspectionType.RETURN)) {
            throw new IllegalArgumentException("Return has already been processed for this booking");
        }
    }

    private InspectionEntity createInspection(BookingEntity booking, ReturnRequestDTO request) {
        return InspectionEntity.builder()
                .booking(booking)
                .type(InspectionType.RETURN) // Explicitly set type
                .batteryLevel(request.getBatteryLevel() != null ? request.getBatteryLevel() : 100)
                .odometer(request.getOdometer() != null ? request.getOdometer() : 0)
                .chargingCablePresent(
                        request.getChargingCablePresent() != null ? request.getChargingCablePresent() : Boolean.TRUE)
                .exteriorCondition(
                        request.getExteriorCondition() != null ? request.getExteriorCondition() : ConditionRating.GOOD)
                .interiorCondition(
                        request.getInteriorCondition() != null ? request.getInteriorCondition() : ConditionRating.GOOD)
                .hasDamage(resolveHasDamage(request))
                .damageDescription(request.getDamageDescription())
                .damagePhotos(request.getDamagePhotos())
                .inspectedById(request.getInspectedById())
                .inspectionNotes(request.getInspectionNotes())
                .inspectedAt(LocalDateTime.now())
                .build();
    }

    private int calculateOvertimeHours(LocalDate scheduledEndDate, LocalDateTime actualReturnDate) {
        if (scheduledEndDate == null) {
            return 0;
        }
        // Convert end date to end of day (rental should return by end of day)
        LocalDateTime scheduledEndDateTime = scheduledEndDate.atTime(23, 59, 59);

        if (actualReturnDate.isAfter(scheduledEndDateTime)) {
            long hoursLate = ChronoUnit.HOURS.between(scheduledEndDateTime, actualReturnDate);
            return (int) Math.max(0, hoursLate);
        }
        return 0;
    }

    private BigDecimal getOvertimeFeePerHour(VehicleEntity vehicle) {
        if (vehicle.getVehicleCategory() != null) {
            return pricingRepository.findCurrentPricingByCategory(vehicle.getVehicleCategory().getId())
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
            BigDecimal driverFee,
            int overtimeHours,
            BigDecimal overtimeFee,
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
                .driverFee(driverFee)
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
                .vehicleName(vehicle.getVehicleCategory() != null ? vehicle.getVehicleCategory().getName() : "Unknown")
                .vehicleLicensePlate(vehicle.getLicensePlate())
                // Customer info
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                // Rental period
                .startDate(resolveScheduledStartDate(booking))
                .endDate(resolveScheduledEndDate(booking))
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
                .damagePhotos(inspection.getDamagePhotos())
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

    private LocalDate resolveScheduledStartDate(BookingEntity booking) {
        List<LocalDate> selectedDates = resolveSelectedDatesFromBooking(booking);
        if (!selectedDates.isEmpty()) {
            return selectedDates.get(0);
        }
        return booking.getStartDate();
    }

    private LocalDate resolveScheduledEndDate(BookingEntity booking) {
        List<LocalDate> selectedDates = resolveSelectedDatesFromBooking(booking);
        if (!selectedDates.isEmpty()) {
            return selectedDates.get(selectedDates.size() - 1);
        }
        return booking.getEndDate();
    }

    private List<LocalDate> resolveSelectedDatesFromBooking(BookingEntity booking) {
        List<LocalDate> parsed = parseSelectedDates(booking.getSelectedDates());
        if (!parsed.isEmpty()) {
            return parsed;
        }

        if (booking.getStartDate() == null || booking.getEndDate() == null) {
            return List.of();
        }

        List<LocalDate> expanded = new ArrayList<>();
        LocalDate cursor = booking.getStartDate();
        while (!cursor.isAfter(booking.getEndDate())) {
            expanded.add(cursor);
            cursor = cursor.plusDays(1);
        }
        if (expanded.isEmpty()) {
            expanded.add(booking.getStartDate());
        }
        return expanded;
    }

    private List<LocalDate> parseSelectedDates(String rawDates) {
        if (rawDates == null || rawDates.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(rawDates.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(value -> {
                    try {
                        return LocalDate.parse(value);
                    } catch (DateTimeParseException ex) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
    }

    private boolean resolveHasDamage(ReturnRequestDTO request) {
        if (Boolean.TRUE.equals(request.getHasDamage())) {
            return true;
        }
        return request.getExteriorCondition() == ConditionRating.DAMAGED
                || request.getInteriorCondition() == ConditionRating.DAMAGED;
    }

    private BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
