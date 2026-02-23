package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.vehicle.VehicleRequestDTO;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.dto.vehicle.VehicleUnavailableDateRangeDTO;
import com.carrentalsystem.entity.*;
import com.carrentalsystem.exception.DuplicateResourceException;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.mapper.VehicleMapper;
import com.carrentalsystem.repository.BookingRepository;
import com.carrentalsystem.repository.PricingRepository;
import com.carrentalsystem.repository.VehicleCategoryRepository;
import com.carrentalsystem.repository.VehicleRepository;
import com.carrentalsystem.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of VehicleService for physical car management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final VehicleCategoryRepository vehicleCategoryRepository;
    private final PricingRepository pricingRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public VehicleResponseDTO createVehicle(VehicleRequestDTO request) {
        log.info("Creating new vehicle with plate: {}", request.getLicensePlate());

        // Check for duplicate license plate
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new DuplicateResourceException("Vehicle", "licensePlate", request.getLicensePlate());
        }

        // Check for duplicate VIN
        if (request.getVin() != null && !request.getVin().isBlank()
                && vehicleRepository.existsByVin(request.getVin())) {
            throw new DuplicateResourceException("Vehicle", "vin", request.getVin());
        }

        // Find category
        VehicleCategoryEntity category = vehicleCategoryRepository.findById(request.getVehicleCategoryId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("VehicleCategory", "id", request.getVehicleCategoryId()));

        VehicleEntity entity = VehicleEntity.builder()
                .vehicleCategory(category)
                .licensePlate(request.getLicensePlate())
                .vin(request.getVin())
                .odometer(request.getOdometer())
                .currentBatteryPercent(request.getCurrentBatteryPercent())
                .status(VehicleStatus.AVAILABLE)
                .build();

        VehicleEntity saved = vehicleRepository.save(entity);
        log.info("Vehicle created with ID: {}", saved.getId());

        return enrichResponseDTO(saved);
    }

    @Override
    public VehicleResponseDTO getVehicleById(Long id) {
        log.debug("Fetching vehicle by ID: {}", id);
        VehicleEntity entity = findVehicleOrThrow(id);
        return enrichResponseDTO(entity);
    }

    @Override
    public List<VehicleResponseDTO> getAllVehicles() {
        log.debug("Fetching all vehicles");
        List<VehicleEntity> vehicles = vehicleRepository.findAllWithCategory();
        return enrichResponseDTOList(vehicles);
    }

    @Override
    public List<VehicleResponseDTO> searchVehicles(String keyword) {
        log.debug("Searching vehicles with keyword: {}", keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllVehicles();
        }
        List<VehicleEntity> vehicles = vehicleRepository.searchByKeyword(keyword);
        return enrichResponseDTOList(vehicles);
    }

    @Override
    public List<VehicleResponseDTO> getAvailableVehicles(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching available vehicles from {} to {}", startDate, endDate);

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        List<VehicleEntity> availableVehicles = vehicleRepository.findByStatusWithCategory(VehicleStatus.AVAILABLE);
        return enrichResponseDTOList(availableVehicles);
    }

    @Override
    public List<VehicleResponseDTO> getVehiclesByCategory(Long categoryId) {
        if (!vehicleCategoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("VehicleCategory", "id", categoryId);
        }
        List<VehicleEntity> vehicles = vehicleRepository.findByVehicleCategoryIdWithCategory(categoryId);
        return enrichResponseDTOList(vehicles);
    }

    @Override
    public List<VehicleUnavailableDateRangeDTO> getUnavailableDateRanges(Long vehicleId) {
        findVehicleOrThrow(vehicleId);

        List<BookingRepository.UnavailableDateRangeProjection> bookings = bookingRepository.findUnavailableBookingsByVehicle(
                vehicleId, BookingStatus.CANCELLED.name(), LocalDate.now());

        return bookings.stream()
                .map(b -> VehicleUnavailableDateRangeDTO.builder()
                        .startDate(b.getStartDate())
                        .endDate(b.getEndDate())
                        .status(normalizeBookingStatusLabel(b.getStatus()))
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO request) {
        log.info("Updating vehicle ID: {}", id);
        VehicleEntity entity = findVehicleOrThrow(id);

        // Check for duplicate license plate (if changed)
        if (!entity.getLicensePlate().equals(request.getLicensePlate())
                && vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new DuplicateResourceException("Vehicle", "licensePlate", request.getLicensePlate());
        }

        // Check for duplicate VIN (if changed)
        if (request.getVin() != null && !request.getVin().isBlank()) {
            if (entity.getVin() == null || !entity.getVin().equals(request.getVin())) {
                if (vehicleRepository.existsByVin(request.getVin())) {
                    throw new DuplicateResourceException("Vehicle", "vin", request.getVin());
                }
            }
        }

        // Update category if changed
        if (request.getVehicleCategoryId() != null
                && !request.getVehicleCategoryId().equals(entity.getVehicleCategory().getId())) {
            VehicleCategoryEntity category = vehicleCategoryRepository.findById(request.getVehicleCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("VehicleCategory", "id",
                            request.getVehicleCategoryId()));
            entity.setVehicleCategory(category);
        }

        entity.setLicensePlate(request.getLicensePlate());
        entity.setVin(request.getVin());
        entity.setOdometer(request.getOdometer());
        entity.setCurrentBatteryPercent(request.getCurrentBatteryPercent());

        VehicleEntity updated = vehicleRepository.save(entity);
        log.info("Vehicle ID: {} updated successfully", id);

        return enrichResponseDTO(updated);
    }

    @Override
    @Transactional
    public VehicleResponseDTO updateVehicleStatus(Long id, VehicleStatus status) {
        log.info("Updating vehicle ID: {} status to: {}", id, status);
        VehicleEntity entity = findVehicleOrThrow(id);
        entity.setStatus(status);
        VehicleEntity updated = vehicleRepository.save(entity);
        return enrichResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        log.info("Deleting vehicle ID: {}", id);
        VehicleEntity entity = findVehicleOrThrow(id);
        if (entity.getStatus() == VehicleStatus.RENTED) {
            throw new IllegalArgumentException("Cannot delete a vehicle that is currently rented");
        }
        vehicleRepository.delete(entity);
        log.info("Vehicle ID: {} deleted successfully", id);
    }

    // =================== Private helpers ===================

    private VehicleEntity findVehicleOrThrow(Long id) {
        return vehicleRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
    }

    /**
     * Enrich a single VehicleResponseDTO with category images and pricing
     */
    private VehicleResponseDTO enrichResponseDTO(VehicleEntity entity) {
        VehicleResponseDTO dto = vehicleMapper.toResponseDTO(entity);

        // Primary image from category
        String primaryImage = getPrimaryImage(entity.getVehicleCategory());
        dto.setImageUrl(primaryImage);

        // Pricing from category
        enrichWithPricing(dto, entity.getVehicleCategory());

        return dto;
    }

    /**
     * Enrich a list of VehicleResponseDTOs with category images and pricing (batch)
     */
    private List<VehicleResponseDTO> enrichResponseDTOList(List<VehicleEntity> entities) {
        if (entities.isEmpty())
            return List.of();

        // Batch fetch all active pricing
        List<PricingEntity> allPricings = pricingRepository.findAllCurrentPricings();
        Map<Long, PricingEntity> pricingMap = allPricings.stream()
                .collect(Collectors.toMap(
                        p -> p.getVehicleCategory().getId(),
                        p -> p,
                        (existing, replacement) -> existing));

        return entities.stream()
                .map(entity -> {
                    VehicleResponseDTO dto = vehicleMapper.toResponseDTO(entity);

                    // Primary image
                    dto.setImageUrl(getPrimaryImage(entity.getVehicleCategory()));

                    // Pricing from map
                    if (entity.getVehicleCategory() != null) {
                        PricingEntity pricing = pricingMap.get(entity.getVehicleCategory().getId());
                        if (pricing != null) {
                            dto.setDailyPrice(pricing.getDailyPrice());
                            dto.setWeeklyPrice(pricing.getWeeklyPrice());
                            dto.setMonthlyPrice(pricing.getMonthlyPrice());
                            dto.setOvertimeFeePerHour(pricing.getOvertimeFeePerHour());
                            dto.setDailyRate(pricing.getDailyPrice()); // Legacy
                        }
                    }

                    return dto;
                })
                .toList();
    }

    private String getPrimaryImage(VehicleCategoryEntity category) {
        if (category == null || category.getImages() == null || category.getImages().isEmpty()) {
            return null;
        }
        return category.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(VehicleCategoryImageEntity::getImageUrl)
                .orElse(category.getImages().get(0).getImageUrl());
    }

    private void enrichWithPricing(VehicleResponseDTO dto, VehicleCategoryEntity category) {
        if (category == null)
            return;
        pricingRepository.findCurrentPricingByCategory(category.getId())
                .ifPresent(pricing -> {
                    dto.setDailyPrice(pricing.getDailyPrice());
                    dto.setWeeklyPrice(pricing.getWeeklyPrice());
                    dto.setMonthlyPrice(pricing.getMonthlyPrice());
                    dto.setOvertimeFeePerHour(pricing.getOvertimeFeePerHour());
                    dto.setDailyRate(pricing.getDailyPrice()); // Legacy compatibility
                });
    }

    private String normalizeBookingStatusLabel(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }
        return rawStatus.trim().toUpperCase(Locale.ROOT);
    }
}
