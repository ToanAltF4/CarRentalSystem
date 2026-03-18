package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.booking.BookingRequestDTO;
import com.carrentalsystem.dto.booking.BookingResponseDTO;
import com.carrentalsystem.dto.booking.DeliveryFeeResponseDTO;
import com.carrentalsystem.dto.booking.DriverFeeResponseDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.exception.*;
import com.carrentalsystem.mapper.BookingMapper;
import com.carrentalsystem.repository.*;
import com.carrentalsystem.repository.VehicleCategoryRepository;
import com.carrentalsystem.service.BookingService;
import com.carrentalsystem.service.PriceCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of BookingService with full business logic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final InvoiceRepository invoiceRepository;
    private final VehicleCategoryImageRepository vehicleCategoryImageRepository;
    private final VehicleCategoryRepository vehicleCategoryRepository;
    private final UserRepository userRepository;
    private final PricingRepository pricingRepository;
    private final RentalTypeRepository rentalTypeRepository;
    private final PickupMethodRepository pickupMethodRepository;
    private final BookingMapper bookingMapper;
    private final PriceCalculationService priceCalculationService;

    private static final String RENTAL_TYPE_SELF_DRIVE = "SELF_DRIVE";

    // Rental type name matching patterns (case-insensitive)
    private boolean isWithDriver(String name) {
        return name != null && (name.equalsIgnoreCase("WITH_DRIVER") ||
                name.toLowerCase().contains("driver") ||
                name.toLowerCase().contains("tài xế"));
    }

    private boolean isSelfDrive(String name) {
        return name != null && (name.equalsIgnoreCase("SELF_DRIVE") ||
                name.toLowerCase().contains("self") ||
                name.toLowerCase().contains("tự lái"));
    }

    private boolean isDelivery(String name) {
        return name != null && (name.equalsIgnoreCase("DELIVERY") ||
                name.toLowerCase().contains("delivery") ||
                name.toLowerCase().contains("giao"));
    }

    private PickupMethodEntity resolveDefaultPickupMethod() {
        List<PickupMethodEntity> methods = pickupMethodRepository.findAll();
        if (methods.isEmpty()) {
            return null;
        }
        return methods.stream()
                .filter(method -> !isDelivery(method.getName()))
                .findFirst()
                .orElse(methods.get(0));
    }

    @Override
    @Transactional(noRollbackFor = { ResourceNotFoundException.class, VehicleNotAvailableException.class,
            IllegalArgumentException.class, IllegalStateException.class })
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        log.info("Creating booking for vehicle ID: {} on selected dates: {}",
                request.getVehicleId(), request.getSelectedDates());

        // 1. Normalize requested rental days (supports both date-range and specific
        // days)
        List<LocalDate> requestedDates = normalizeRequestedDates(request);
        LocalDate normalizedStartDate = requestedDates.get(0);
        LocalDate normalizedEndDate = requestedDates.get(requestedDates.size() - 1);

        // 2. Find and validate vehicle
        VehicleEntity vehicle;

        if (request.getVehicleId() != null) {
            // Case 1: Booking specific vehicle ID
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));
        } else if (request.getBrand() != null && request.getModel() != null) {
            // Case 2: Booking by Model (Auto-assign available vehicle from category)
            var category = vehicleCategoryRepository.findByBrandAndNameAndModel(
                    request.getBrand(), request.getModel(), request.getModel());
            List<VehicleEntity> candidates;
            if (category.isPresent()) {
                candidates = vehicleRepository.findByVehicleCategoryId(category.get().getId())
                        .stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).toList();
            } else {
                candidates = List.of();
            }

            // Filter for one that has no conflicting bookings
            vehicle = candidates.stream()
                    .filter(v -> findConflictingDates(v.getId(), requestedDates).isEmpty())
                    .findFirst()
                    .orElseThrow(() -> new com.carrentalsystem.exception.VehicleNotAvailableException(0L,
                            "No " + request.getBrand() + " " + request.getModel() + " available for selected dates"));
        } else {
            throw new IllegalArgumentException("Either vehicleId or brand/model must be provided");
        }

        // 3. Check vehicle status is AVAILABLE
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new VehicleNotAvailableException(vehicle.getId(),
                    "Vehicle status is " + vehicle.getStatus());
        }

        // 4. Check for conflicts by exact day
        List<LocalDate> conflictingDates = findConflictingDates(vehicle.getId(), requestedDates);
        if (!conflictingDates.isEmpty()) {
            throw new VehicleNotAvailableException(vehicle.getId(),
                    "Booking conflicts on dates: " + formatDates(conflictingDates));
        }

        // 5. Check user's driver license status
        UserEntity user = userRepository.findByEmail(request.getCustomerEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getCustomerEmail()));

        boolean hasApprovedLicense = user.getLicenseStatus() == LicenseStatus.APPROVED;
        if (!hasApprovedLicense) {
            throw new IllegalArgumentException(
                    "Driver's license not verified. Please upload and verify your driver's license before booking.");
        }

        // 6. Calculate base pricing
        BigDecimal dailyRate = calculateDailyRate(vehicle);
        int totalDays = requestedDates.size();
        BigDecimal rentalFee = dailyRate.multiply(BigDecimal.valueOf(totalDays));

        // 7. Handle rental type and calculate fees
        RentalTypeEntity rentalType = null;
        PickupMethodEntity pickupMethod = null;
        BigDecimal driverFee = BigDecimal.ZERO;
        BigDecimal deliveryFee = BigDecimal.ZERO;
        String deliveryAddress = null;
        BigDecimal deliveryDistanceKm = null;
        boolean withDriverMode = false;

        if (request.getRentalTypeId() != null) {
            rentalType = rentalTypeRepository.findById(request.getRentalTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("RentalType", "id", request.getRentalTypeId()));

            if (isWithDriver(rentalType.getName())) {
                withDriverMode = true;
                // WITH_DRIVER: Calculate driver fee
                DriverFeeResponseDTO driverFeeResult;
                if (vehicle.getVehicleCategory() != null) {
                    driverFeeResult = priceCalculationService.calculateDriverFeeByCategory(totalDays,
                            vehicle.getVehicleCategory().getId());
                } else {
                    driverFeeResult = priceCalculationService.calculateDriverFee(totalDays);
                }
                driverFee = driverFeeResult.getTotalDriverFee();
                log.info("WITH_DRIVER selected: driver_fee = {}", driverFee);
            }
        } else {
            // Default to SELF_DRIVE if not specified (backward compatibility)
            rentalType = rentalTypeRepository.findByName(RENTAL_TYPE_SELF_DRIVE)
                    .or(() -> rentalTypeRepository.findAll().stream()
                            .filter(type -> isSelfDrive(type.getName()))
                            .findFirst())
                    .orElse(null);
        }

        // 7b. Handle pickup method (common for ALL rental types)
        if (request.getPickupMethodId() != null) {
            pickupMethod = pickupMethodRepository.findById(request.getPickupMethodId())
                    .orElseThrow(() -> new ResourceNotFoundException("PickupMethod", "id",
                            request.getPickupMethodId()));

            if (isDelivery(pickupMethod.getName())) {
                // DELIVERY: Calculate delivery fee
                if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
                    throw new IllegalArgumentException(
                            "Delivery address is required for DELIVERY pickup method");
                }
                deliveryAddress = request.getDeliveryAddress().trim();
                DeliveryFeeResponseDTO deliveryResult;
                if (request.getDeliveryDistanceKm() != null
                        && request.getDeliveryDistanceKm().compareTo(BigDecimal.ZERO) > 0) {
                    deliveryResult = priceCalculationService.calculateDeliveryFee(
                            deliveryAddress,
                            request.getDeliveryDistanceKm(),
                            withDriverMode);
                } else {
                    // No OSRM distance provided, use address-based fallback
                    if (withDriverMode) {
                        // Calculate fallback distance then re-calc with withDriver=true
                        deliveryResult = priceCalculationService.calculateDeliveryFee(deliveryAddress);
                        if (deliveryResult.getDistanceKm() != null) {
                            deliveryResult = priceCalculationService.calculateDeliveryFee(
                                    deliveryAddress, deliveryResult.getDistanceKm(), true);
                        }
                    } else {
                        deliveryResult = priceCalculationService.calculateDeliveryFee(deliveryAddress);
                    }
                }
                deliveryFee = deliveryResult.getTotalDeliveryFee();
                deliveryDistanceKm = deliveryResult.getDistanceKm();
                log.info("DELIVERY selected (withDriver={}): distance = {} km, delivery_fee = {}",
                        withDriverMode, deliveryDistanceKm, deliveryFee);
            } else {
                // STORE: No delivery fee
                log.info("STORE pickup selected: delivery_fee = 0");
            }
        } else {
            // No pickupMethodId provided, use default
            pickupMethod = resolveDefaultPickupMethod();
        }

        if (pickupMethod == null) {
            throw new IllegalArgumentException("No pickup method configured in system");
        }

        // 7c. Handle insurance fee and service fee from frontend
        BigDecimal insuranceFee = request.getInsuranceFee() != null
                ? request.getInsuranceFee()
                : BigDecimal.ZERO;
        BigDecimal serviceFee = request.getServiceFee() != null
                ? request.getServiceFee()
                : BigDecimal.ZERO;

        // 8. Calculate total amount (rental + driver + delivery + insurance + service)
        BigDecimal totalAmount = rentalFee.add(driverFee).add(deliveryFee)
                .add(insuranceFee).add(serviceFee);
        log.info(
                "Price breakdown: rental_fee={}, driver_fee={}, delivery_fee={}, insurance_fee={}, service_fee={}, total={}",
                rentalFee, driverFee, deliveryFee, insuranceFee, serviceFee, totalAmount);

        // 9. Create booking entity - Auto CONFIRMED since license is verified
        BookingEntity booking = bookingMapper.toEntity(request);
        booking.setBookingCode(generateBookingCode());
        booking.setVehicle(vehicle);
        booking.setUser(user);
        booking.setCustomerName(
                request.getCustomerName() != null && !request.getCustomerName().isBlank()
                        ? request.getCustomerName().trim()
                        : user.getFullName());
        booking.setCustomerEmail(user.getEmail());
        booking.setCustomerPhone(
                request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank()
                        ? request.getCustomerPhone().trim()
                        : user.getPhoneNumber());
        booking.setStartDate(normalizedStartDate);
        booking.setEndDate(normalizedEndDate);
        booking.setSelectedDates(toSelectedDatesStorage(requestedDates));
        booking.setTotalDays(totalDays);
        booking.setDailyRate(dailyRate);
        booking.setRentalFee(rentalFee);
        booking.setDriverFee(driverFee);
        booking.setDeliveryFee(deliveryFee);
        booking.setDeliveryAddress(deliveryAddress);
        booking.setDeliveryDistanceKm(deliveryDistanceKm);
        booking.setInsuranceFee(insuranceFee);
        booking.setServiceFee(serviceFee);
        booking.setTotalAmount(totalAmount);
        booking.setRentalType(rentalType);
        booking.setPickupMethod(pickupMethod);
        booking.setStatus(BookingStatus.PENDING); // Wait for payment

        // 10. Save booking
        BookingEntity saved = bookingRepository.save(booking);
        log.info("Booking created and auto-confirmed with code: {}", saved.getBookingCode());

        return toEnrichedDTO(saved);
    }

    @Override
    public BookingResponseDTO getBookingById(Long id) {
        BookingEntity booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return toDetailDTO(booking);
    }

    @Override
    public BookingResponseDTO getBookingByCode(String bookingCode) {
        BookingEntity booking = bookingRepository.findByBookingCodeWithDetails(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "code", bookingCode));
        return toDetailDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        List<BookingEntity> bookings = bookingRepository.findAllWithVehicle();
        return toEnrichedDTOList(bookings);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByStatus(BookingStatus status) {
        List<BookingEntity> bookings = bookingRepository.findByStatusOrderByCreatedAtDescWithDetails(status);
        return toEnrichedDTOList(bookings);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByCustomerEmail(String email) {
        long startNs = System.nanoTime();
        List<BookingEntity> bookings = bookingRepository.findByCustomerEmailOrderByCreatedAtDescWithDetails(email);
        long fetchNs = System.nanoTime();
        // Customer booking list must include vehicle thumbnails so each booking card
        // shows the rented car image instead of the frontend fallback image.
        List<BookingResponseDTO> result = toEnrichedDTOList(bookings, false, false, false, true, true);
        long mapNs = System.nanoTime();
        log.info("getBookingsByCustomerEmail: email={}, bookings={}, fetchMs={}, mapMs={}, totalMs={}",
                email,
                bookings != null ? bookings.size() : 0,
                (fetchNs - startNs) / 1_000_000,
                (mapNs - fetchNs) / 1_000_000,
                (mapNs - startNs) / 1_000_000);
        return result;
    }

    @Override
    public List<BookingResponseDTO> getBookingsByVehicle(Long vehicleId) {
        // Verify vehicle exists
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle", "id", vehicleId);
        }
        List<BookingEntity> bookings = bookingRepository.findByVehicleIdOrderByCreatedAtDescWithDetails(vehicleId);
        return toEnrichedDTOList(bookings);
    }

    @Override
    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatus status) {
        log.info("Updating booking ID: {} to status: {}", id, status);

        BookingEntity booking = findBookingOrThrow(id);

        // Validate status transition
        validateStatusTransition(booking.getStatus(), status);

        booking.setStatus(status);

        // Vehicle operational status is managed separately
        // (AVAILABLE/MAINTENANCE/INACTIVE).
        // Booking timeline (selected dates + booking status) handles rental occupancy.

        BookingEntity updated = bookingRepository.save(booking);
        return toEnrichedDTO(updated);
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long id) {
        log.info("Cancelling booking ID: {}", id);

        BookingEntity booking = findBookingOrThrow(id);

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel a completed booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        BookingEntity cancelled = bookingRepository.save(booking);
        return toEnrichedDTO(cancelled);
    }

    @Override
    public List<BookingResponseDTO> getUpcomingBookings() {
        LocalDate today = LocalDate.now();
        // Pre-filter at DB level: only non-terminal bookings whose end date hasn't passed.
        // Avoids loading the entire bookings table into memory.
        List<BookingEntity> bookings = bookingRepository.findUpcomingWithDetails(
                List.of(BookingStatus.CANCELLED, BookingStatus.COMPLETED), today);
        return toEnrichedDTOList(bookings);
    }

    // ============== Private Helper Methods ==============

    private BookingResponseDTO toEnrichedDTO(BookingEntity entity) {
        return toEnrichedDTO(entity, null, null, null, true, true, true, true);
    }

    private BookingResponseDTO toDetailDTO(BookingEntity entity) {
        // Detail endpoint does not render vehicle thumbnail, so skip image lookups to reduce DB round-trips.
        return toEnrichedDTOList(List.of(entity), true, true, false, false, false).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", entity.getId()));
    }

    private BookingResponseDTO toEnrichedDTO(BookingEntity entity, java.util.Map<Long, UserEntity> userMap,
            java.util.Map<Long, java.math.BigDecimal> damageFeeMap,
            java.util.Map<Long, String> vehicleImageMap,
            boolean includeSelectedDates,
            boolean allowImageFallback,
            boolean includeUserEnrichment,
            boolean includeFinalInvoice) {
        BookingResponseDTO dto = bookingMapper.toResponseDTO(entity);

        // Helper to resolve user from map or DB
        java.util.function.Function<Long, UserEntity> resolveUser = (id) -> {
            if (!includeUserEnrichment || id == null) {
                return null;
            }
            if (userMap != null && userMap.containsKey(id)) {
                return userMap.get(id);
            }
            return userRepository.findById(id).orElse(null);
        };

        // Enrich Staff Name
        if (includeUserEnrichment) {
            UserEntity staff = resolveUser.apply(entity.getAssignedStaffId());
            if (staff != null) {
                dto.setAssignedStaffName(staff.getFullName());
                dto.setAssignedStaffEmail(staff.getEmail());
                dto.setAssignedStaffPhone(staff.getPhoneNumber());
            }
        }

        // Enrich Driver Name
        if (includeUserEnrichment) {
            UserEntity driver = resolveUser.apply(entity.getDriverId());
            if (driver != null) {
                dto.setDriverName(driver.getFullName());
                dto.setDriverEmail(driver.getEmail());
                dto.setDriverPhone(driver.getPhoneNumber());
            }
        }

        // Enrich Assigned By
        if (includeUserEnrichment) {
            UserEntity assigner = resolveUser.apply(entity.getAssignedBy());
            if (assigner != null) {
                dto.setAssignedByName(assigner.getFullName());
            }
        }

        // Rental Type Name (Fallback if Mapper missed it or null)
        if (dto.getRentalTypeName() == null && entity.getRentalType() != null) {
            dto.setRentalTypeName(entity.getRentalType().getName());
            dto.setRentalTypeId(entity.getRentalType().getId());
        } else if (dto.getRentalTypeName() == null) {
            dto.setRentalTypeName("Self Drive");
        }

        // Pickup Method Name
        if (dto.getPickupMethodName() == null && entity.getPickupMethod() != null) {
            dto.setPickupMethodName(entity.getPickupMethod().getName());
            dto.setPickupMethodId(entity.getPickupMethod().getId());
        }

        Long categoryId = entity.getVehicle() != null && entity.getVehicle().getVehicleCategory() != null
                ? entity.getVehicle().getVehicleCategory().getId()
                : null;
        String vehicleImage = categoryId != null && vehicleImageMap != null ? vehicleImageMap.get(categoryId) : null;
        if (vehicleImage == null && categoryId != null && allowImageFallback) {
            vehicleImage = resolvePrimaryImage(categoryId);
        }
        if (vehicleImage != null) {
            dto.setVehicleImage(vehicleImage);
        }

        // Fee breakdown
        dto.setRentalFee(entity.getRentalFee());
        dto.setDriverFee(entity.getDriverFee());
        dto.setDeliveryFee(entity.getDeliveryFee());
        dto.setInsuranceFee(entity.getInsuranceFee());
        dto.setServiceFee(entity.getServiceFee());
        dto.setDeliveryAddress(entity.getDeliveryAddress());
        dto.setDeliveryDistanceKm(entity.getDeliveryDistanceKm());
        if (includeSelectedDates) {
            dto.setSelectedDates(resolveSelectedDatesFromBooking(entity));
        }

        if (includeFinalInvoice) {
            // Final invoice total = rental total paid + damage fee (if any)
            java.math.BigDecimal damageFee = null;
            if (damageFeeMap != null) {
                damageFee = damageFeeMap.get(entity.getId());
            }
            if (damageFee == null) {
                InvoiceEntity invoice = invoiceRepository.findByBookingId(entity.getId()).orElse(null);
                damageFee = invoice != null && invoice.getDamageFee() != null ? invoice.getDamageFee() : BigDecimal.ZERO;
            }
            if (damageFee != null) {
                BigDecimal rentalTotal = entity.getTotalAmount() != null ? entity.getTotalAmount() : BigDecimal.ZERO;
                dto.setFinalInvoiceTotal(rentalTotal.add(damageFee));
            }
        }

        return dto;
    }

    private List<BookingResponseDTO> toEnrichedDTOList(List<BookingEntity> entities) {
        return toEnrichedDTOList(entities, true, true, false, true, true);
    }

    private List<BookingResponseDTO> toEnrichedDTOList(List<BookingEntity> entities,
            boolean includeUserEnrichment,
            boolean includeSelectedDates,
            boolean allowImageFallback,
            boolean includeVehicleImages,
            boolean includeFinalInvoice) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }

        // 1. Collect all User IDs to fetch
        java.util.Set<Long> userIds = new java.util.HashSet<>();
        if (includeUserEnrichment) {
            entities.forEach(b -> {
                if (b.getAssignedStaffId() != null)
                    userIds.add(b.getAssignedStaffId());
                if (b.getDriverId() != null)
                    userIds.add(b.getDriverId());
                if (b.getAssignedBy() != null)
                    userIds.add(b.getAssignedBy());
            });
        }

        // 2. Batch fetch users
        java.util.Map<Long, UserEntity> userMap = new java.util.HashMap<>();
        if (!userIds.isEmpty()) {
            List<UserEntity> users = userRepository.findAllById(userIds);
            userMap = users.stream().collect(
                    java.util.stream.Collectors.toMap(UserEntity::getId, java.util.function.Function.identity()));
        }

        // 3. Batch fetch damage fees for final totals
        java.util.Map<Long, java.math.BigDecimal> damageFeeMap = java.util.Map.of();
        java.util.List<Long> bookingIds = entities.stream()
                .map(BookingEntity::getId)
                .filter(java.util.Objects::nonNull)
                .toList();
        if (includeFinalInvoice && !bookingIds.isEmpty()) {
            damageFeeMap = invoiceRepository.findDamageByBookingIdIn(bookingIds).stream()
                    .filter(inv -> inv.getBookingId() != null)
                    .collect(java.util.stream.Collectors.toMap(
                            inv -> inv.getBookingId(),
                            inv -> inv.getDamageFee() != null ? inv.getDamageFee() : java.math.BigDecimal.ZERO,
                            (a, b) -> a));
        }

        // 4. Batch fetch primary vehicle images (optional)
        java.util.Map<Long, String> vehicleImageMap = java.util.Map.of();
        if (includeVehicleImages) {
            java.util.List<Long> categoryIds = entities.stream()
                    .map(BookingEntity::getVehicle)
                    .filter(java.util.Objects::nonNull)
                    .map(VehicleEntity::getVehicleCategory)
                    .filter(java.util.Objects::nonNull)
                    .map(VehicleCategoryEntity::getId)
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .toList();
            if (!categoryIds.isEmpty()) {
                vehicleImageMap = vehicleCategoryImageRepository.findByVehicleCategoryIdInOrdered(categoryIds).stream()
                        .filter(img -> img.getVehicleCategory() != null && img.getVehicleCategory().getId() != null)
                        .collect(java.util.stream.Collectors.toMap(
                                img -> img.getVehicleCategory().getId(),
                                img -> img.getImageUrl(),
                                (a, b) -> a));
            }
        }

        // 5. Map to DTOs using the userMap + damageFeeMap + vehicleImageMap
        final java.util.Map<Long, UserEntity> finalUserMap = userMap;
        final java.util.Map<Long, java.math.BigDecimal> finalDamageFeeMap = damageFeeMap;
        final java.util.Map<Long, String> finalVehicleImageMap = vehicleImageMap;
        return entities.stream()
                .map(entity -> toEnrichedDTO(
                        entity,
                        finalUserMap,
                        finalDamageFeeMap,
                        includeVehicleImages ? finalVehicleImageMap : null,
                        includeSelectedDates,
                        allowImageFallback,
                        includeUserEnrichment,
                        includeFinalInvoice))
                .toList();
    }

    private String resolvePrimaryImage(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return vehicleCategoryImageRepository.findByVehicleCategoryIdOrdered(categoryId).stream()
                .findFirst()
                .map(VehicleCategoryImageEntity::getImageUrl)
                .orElse(null);
    }

    private List<LocalDate> normalizeRequestedDates(BookingRequestDTO request) {
        List<LocalDate> selectedDates = request.getSelectedDates();
        if (selectedDates != null && !selectedDates.isEmpty()) {
            List<LocalDate> normalized = selectedDates.stream()
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .sorted()
                    .toList();

            if (normalized.isEmpty()) {
                throw new IllegalArgumentException("Please select at least one rental day");
            }
            if (normalized.stream().anyMatch(date -> date.isBefore(LocalDate.now()))) {
                throw new IllegalArgumentException("Selected dates cannot be in the past");
            }
            return normalized;
        }

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Please select at least one rental day");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Selected dates cannot be in the past");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be on/after start date");
        }

        List<LocalDate> expanded = new ArrayList<>();
        LocalDate cursor = startDate;
        while (!cursor.isAfter(endDate)) {
            expanded.add(cursor);
            cursor = cursor.plusDays(1);
        }
        if (expanded.isEmpty()) {
            expanded.add(startDate);
        }
        return expanded;
    }

    private List<LocalDate> resolveSelectedDatesFromBooking(BookingEntity booking) {
        List<LocalDate> parsed = parseSelectedDatesStorage(booking.getSelectedDates());
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

    private List<LocalDate> parseSelectedDatesStorage(String rawDates) {
        if (rawDates == null || rawDates.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(rawDates.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(date -> {
                    try {
                        return LocalDate.parse(date);
                    } catch (DateTimeParseException ex) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
    }

    private String toSelectedDatesStorage(List<LocalDate> dates) {
        return dates.stream()
                .sorted()
                .map(LocalDate::toString)
                .collect(Collectors.joining(","));
    }

    private List<LocalDate> findConflictingDates(Long vehicleId, List<LocalDate> requestedDates) {
        if (requestedDates.isEmpty()) {
            return List.of();
        }
        Set<LocalDate> requestedSet = new HashSet<>(requestedDates);
        LocalDate minDate = requestedDates.stream().min(Comparator.naturalOrder()).orElseThrow();
        LocalDate maxDate = requestedDates.stream().max(Comparator.naturalOrder()).orElseThrow();

        // Pre-filter at DB level using date-range overlap — avoids loading all vehicle
        // bookings into memory just to parse CSV dates for conflict detection.
        return bookingRepository.findActiveByVehicleIdAndDateRange(
                        vehicleId,
                        List.of(BookingStatus.CANCELLED, BookingStatus.COMPLETED),
                        minDate,
                        maxDate).stream()
                .flatMap(booking -> resolveSelectedDatesFromBooking(booking).stream())
                .filter(requestedSet::contains)
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();
    }

    private boolean hasUpcomingRentalDay(BookingEntity booking, LocalDate today) {
        return resolveSelectedDatesFromBooking(booking).stream()
                .anyMatch(day -> !day.isBefore(today));
    }

    private LocalDate firstUpcomingRentalDay(BookingEntity booking, LocalDate today) {
        return resolveSelectedDatesFromBooking(booking).stream()
                .filter(day -> !day.isBefore(today))
                .findFirst()
                .orElse(null);
    }

    private String formatDates(List<LocalDate> dates) {
        return dates.stream()
                .map(LocalDate::toString)
                .collect(Collectors.joining(", "));
    }

    private BigDecimal calculateDailyRate(VehicleEntity vehicle) {
        // Get pricing from vehicle category
        if (vehicle.getVehicleCategory() != null) {
            return pricingRepository.findCurrentPricingByCategory(vehicle.getVehicleCategory().getId())
                    .map(PricingEntity::getDailyPrice)
                    .orElseThrow(() -> new PricingNotFoundException(
                            "No active pricing found for category ID: " + vehicle.getVehicleCategory().getId()));
        }
        throw new PricingNotFoundException("No pricing available for vehicle ID: " + vehicle.getId());
    }

    private String generateBookingCode() {
        // Format: BK-YYYYMMDD-XXXX (e.g., BK-20240115-A1B2)
        String datePart = LocalDate.now().toString().replace("-", "");
        String randomPart = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "BK-" + datePart + "-" + randomPart;
    }

    private BookingEntity findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    private void validateStatusTransition(BookingStatus current, BookingStatus next) {
        // Define valid transitions
        boolean valid = switch (current) {
            case PENDING -> next == BookingStatus.CONFIRMED || next == BookingStatus.CANCELLED;
            case CONFIRMED ->
                next == BookingStatus.IN_PROGRESS || next == BookingStatus.ASSIGNED || next == BookingStatus.CANCELLED;
            case ASSIGNED ->
                next == BookingStatus.CONFIRMED || next == BookingStatus.IN_PROGRESS || next == BookingStatus.CANCELLED;
            case IN_PROGRESS ->
                next == BookingStatus.ONGOING || next == BookingStatus.RETURN_PENDING_PAYMENT
                        || next == BookingStatus.COMPLETED || next == BookingStatus.CANCELLED;
            case ONGOING ->
                next == BookingStatus.RETURN_PENDING_PAYMENT || next == BookingStatus.COMPLETED
                        || next == BookingStatus.CANCELLED;
            case RETURN_PENDING_PAYMENT -> next == BookingStatus.COMPLETED || next == BookingStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false; // Terminal states
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    String.format("Invalid status transition from %s to %s", current, next));
        }
    }
}
