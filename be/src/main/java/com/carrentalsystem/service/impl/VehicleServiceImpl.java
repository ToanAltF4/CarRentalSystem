package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.vehicle.VehicleRequestDTO;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.entity.VehicleCategoryEntity;
import com.carrentalsystem.entity.VehicleEntity;
import com.carrentalsystem.entity.VehicleStatus;
import com.carrentalsystem.exception.DuplicateResourceException;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.mapper.VehicleMapper;
import com.carrentalsystem.repository.VehicleCategoryRepository;
import com.carrentalsystem.repository.VehicleRepository;
import com.carrentalsystem.service.VehicleService;
import com.carrentalsystem.specification.VehicleSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return vehicleMapper.toResponseDTO(entity);
    }

    @Override
    public List<VehicleResponseDTO> getAllVehicles() {
        log.debug("Fetching all vehicles");

        List<VehicleEntity> vehicles = vehicleRepository.findAll();
        return vehicleMapper.toResponseDTOList(vehicles);
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

        return vehicleMapper.toResponseDTOList(vehicles);
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
        // booking conflicts
        // Current implementation returns all vehicles with AVAILABLE status
        List<VehicleEntity> availableVehicles = vehicleRepository.findAvailableVehicles(startDate, endDate);

        return vehicleMapper.toResponseDTOList(availableVehicles);
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
}
