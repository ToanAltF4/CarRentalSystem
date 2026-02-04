package com.carrentalsystem.service;

import com.carrentalsystem.dto.vehicle.VehicleRequestDTO;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.entity.VehicleStatus;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for Vehicle operations.
 */
public interface VehicleService {

    /**
     * Create a new vehicle
     */
    VehicleResponseDTO createVehicle(VehicleRequestDTO request);

    /**
     * Get vehicle by ID
     */
    VehicleResponseDTO getVehicleById(Long id);

    /**
     * Get all vehicles
     */
    List<VehicleResponseDTO> getAllVehicles();

    /**
     * Get available vehicle models (grouped by brand and model)
     */
    List<com.carrentalsystem.dto.vehicle.VehicleModelDTO> getVehicleModels();

    /**
     * Search vehicles by keyword (name, model, brand)
     */
    List<VehicleResponseDTO> searchVehicles(String keyword);

    /**
     * Get available vehicles for a date range
     */
    List<VehicleResponseDTO> getAvailableVehicles(LocalDate startDate, LocalDate endDate);

    /**
     * Update vehicle by ID
     */
    VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO request);

    /**
     * Update vehicle status
     */
    VehicleResponseDTO updateVehicleStatus(Long id, VehicleStatus status);

    /**
     * Delete vehicle by ID
     */
    void deleteVehicle(Long id);

    /**
     * Get all distinct brands
     */
    List<String> getAllBrands();
}
