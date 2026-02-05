package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.vehicle.VehicleRequestDTO;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.entity.PricingEntity;
import com.carrentalsystem.entity.VehicleCategoryEntity;
import com.carrentalsystem.entity.VehicleEntity;
import com.carrentalsystem.entity.VehicleStatus;
import com.carrentalsystem.exception.DuplicateResourceException;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.mapper.VehicleMapper;
import com.carrentalsystem.repository.PricingRepository;
import com.carrentalsystem.repository.VehicleCategoryRepository;
import com.carrentalsystem.repository.VehicleRepository;
import com.carrentalsystem.service.VehicleService;
import com.carrentalsystem.specification.VehicleSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Implementation of VehicleService.
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

    @Override
    @Transactional
    public VehicleResponseDTO createVehicle(VehicleRequestDTO request) {
        log.info("Creating new vehicle: {} - {}", request.getBrand(), request.getModel());

        // Check for duplicate license plate
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new DuplicateResourceException("Vehicle", "licensePlate", request.getLicensePlate());
        }

        VehicleEntity entity = vehicleMapper.toEntity(request);

        // Map Category
        VehicleCategoryEntity category = vehicleCategoryRepository.findByName(request.getCategory())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "name", request.getCategory()));
        entity.setCategory(category);

        entity.setStatus(VehicleStatus.AVAILABLE);

        VehicleEntity saved = vehicleRepository.save(entity);
        log.info("Vehicle created with ID: {}", saved.getId());

        return vehicleMapper.toResponseDTO(saved);
    }

    @Override
    public VehicleResponseDTO getVehicleById(Long id) {
        log.debug("Fetching vehicle by ID: {}", id);

        VehicleEntity entity = findVehicleOrThrow(id);
        return toResponseWithOvertimeFee(entity);
    }

    @Override
    public List<VehicleResponseDTO> getAllVehicles() {
        log.debug("Fetching all vehicles (Joined)");

        // Use new method with JOIN FETCH
        List<VehicleEntity> vehicles = vehicleRepository.findAllWithCategory();
        return toResponseListWithOvertimeFee(vehicles);
    }

    @Override
    public List<VehicleResponseDTO> searchVehicles(String keyword) {
        log.debug("Searching vehicles with keyword: {}", keyword);

        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllVehicles();
        }

        // Using JPA Specification for flexible search
        Specification<VehicleEntity> spec = VehicleSpecification.containsKeyword(keyword);
        List<VehicleEntity> vehicles = vehicleRepository.findAll(spec);

        return toResponseListWithOvertimeFee(vehicles);
    }

    @Override
    public List<VehicleResponseDTO> getAvailableVehicles(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching available vehicles from {} to {}", startDate, endDate);

        // Validate date range
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }

        // TODO: Once Rental entity is implemented, update this query to check for
        // booking conflicts.
        List<VehicleEntity> availableVehicles = vehicleRepository.findByStatusWithCategory(VehicleStatus.AVAILABLE);

        return toResponseListWithOvertimeFee(availableVehicles);
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

        vehicleMapper.updateEntityFromDTO(request, entity);

        // Update category if provided
        if (request.getCategory() != null) {
            VehicleCategoryEntity category = vehicleCategoryRepository.findByName(request.getCategory())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "name", request.getCategory()));
            entity.setCategory(category);
        }

        VehicleEntity updated = vehicleRepository.save(entity);

        log.info("Vehicle ID: {} updated successfully", id);
        return vehicleMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public VehicleResponseDTO updateVehicleStatus(Long id, VehicleStatus status) {
        log.info("Updating vehicle ID: {} status to: {}", id, status);

        VehicleEntity entity = findVehicleOrThrow(id);
        entity.setStatus(status);

        VehicleEntity updated = vehicleRepository.save(entity);
        return vehicleMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        log.info("Deleting vehicle ID: {}", id);

        VehicleEntity entity = findVehicleOrThrow(id);

        // Prevent deletion if vehicle is currently rented
        if (entity.getStatus() == VehicleStatus.RENTED) {
            throw new IllegalArgumentException("Cannot delete a vehicle that is currently rented");
        }

        vehicleRepository.delete(entity);
        log.info("Vehicle ID: {} deleted successfully", id);
    }

    @Override
    public List<String> getAllBrands() {
        return vehicleRepository.findAllBrands();
    }

    /**
     * Helper method to find vehicle or throw ResourceNotFoundException
     */
    private VehicleEntity findVehicleOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
    }

    /**
     * Get overtime fee per hour for a vehicle based on its category's active
     * pricing
     */
    private BigDecimal getOvertimeFeePerHour(VehicleEntity vehicle) {
        if (vehicle.getCategory() == null) {
            return BigDecimal.valueOf(50000); // Default 50,000 VND
        }
        return pricingRepository.findCurrentPricingByCategory(vehicle.getCategory().getId())
                .map(PricingEntity::getOvertimeFeePerHour)
                .orElse(BigDecimal.valueOf(50000)); // Default 50,000 VND
    }

    /**
     * Enrich VehicleResponseDTO with overtime fee from pricing
     */
    private VehicleResponseDTO enrichWithOvertimeFee(VehicleResponseDTO dto, VehicleEntity entity) {
        dto.setOvertimeFeePerHour(getOvertimeFeePerHour(entity));
        return dto;
    }

    /**
     * Convert entity to DTO with overtime fee
     */
    private VehicleResponseDTO toResponseWithOvertimeFee(VehicleEntity entity) {
        VehicleResponseDTO dto = vehicleMapper.toResponseDTO(entity);
        return enrichWithOvertimeFee(dto, entity);
    }

    /**
     * Convert list of entities to DTOs with overtime fee, using batch pricing
     * lookup to avoid N+1 queries.
     */
    private List<VehicleResponseDTO> toResponseListWithOvertimeFee(List<VehicleEntity> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }

        // Batch fetch all active pricing
        List<PricingEntity> allPricings = pricingRepository.findAllCurrentPricings();

        // Map CategoryID -> OvertimeFee
        java.util.Map<Long, BigDecimal> pricingMap = allPricings.stream()
                .collect(java.util.stream.Collectors.toMap(
                        p -> p.getVehicleCategory().getId(),
                        PricingEntity::getOvertimeFeePerHour,
                        (existing, replacement) -> existing // In case of duplicate active pricing (shouldn't happen),
                                                            // keep first
                ));

        return entities.stream()
                .map(entity -> {
                    VehicleResponseDTO dto = vehicleMapper.toResponseDTO(entity);

                    // Lookup fee from map, default to 50,000 if not found
                    BigDecimal fee = BigDecimal.valueOf(50000);
                    if (entity.getCategory() != null) {
                        fee = pricingMap.getOrDefault(entity.getCategory().getId(), BigDecimal.valueOf(50000));
                    }

                    dto.setOvertimeFeePerHour(fee);
                    return dto;
                })
                .toList();
    }

    @Override
    public List<com.carrentalsystem.dto.vehicle.VehicleModelDTO> getVehicleModels() {
        // Since we are back to single Entity model (no Category entity), we group by
        // Brand + Model
        // Ideally we should use a custom DTO projection query, but for now we fetch all
        // and group in memory
        List<VehicleEntity> allVehicles = vehicleRepository.findAll();

        return allVehicles.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        v -> v.getBrand() + "|" + v.getModel(), // Key
                        java.util.stream.Collectors.toList() // Value: List of vehicles
                ))
                .values().stream()
                .map(list -> {
                    VehicleEntity prototype = list.get(0); // Use first one as template
                    long availableCount = list.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();

                    return com.carrentalsystem.dto.vehicle.VehicleModelDTO.builder()
                            .id(prototype.getId()) // Use any ID, frontend just needs it for linking
                            .name(prototype.getName())
                            .model(prototype.getModel())
                            .brand(prototype.getBrand())
                            .batteryCapacityKwh(prototype.getBatteryCapacityKwh())
                            .rangeKm(prototype.getRangeKm())
                            .chargingTimeHours(prototype.getChargingTimeHours())
                            .dailyRate(prototype.getDailyRate())
                            .imageUrl(prototype.getImageUrl())
                            .seats(prototype.getSeats())
                            .description(prototype.getDescription())
                            .categoryName(prototype.getBrand() + " " + prototype.getModel())
                            .availableCount((int) availableCount)
                            .build();
                })
                .toList();
    }
}
