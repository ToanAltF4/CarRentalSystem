package com.carrentalsystem.service;

import com.carrentalsystem.dto.vehicle.VehicleRequestDTO;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.dto.vehicle.VehicleUnavailableDateRangeDTO;
import com.carrentalsystem.entity.VehicleStatus;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for Vehicle (physical car) operations.
 */
public interface VehicleService {

    VehicleResponseDTO createVehicle(VehicleRequestDTO request);

    VehicleResponseDTO getVehicleById(Long id);

    List<VehicleResponseDTO> getAllVehicles();

    List<VehicleResponseDTO> searchVehicles(String keyword);

    List<VehicleResponseDTO> getAvailableVehicles(LocalDate startDate, LocalDate endDate);

    List<VehicleResponseDTO> getVehiclesByCategory(Long categoryId);

    List<VehicleUnavailableDateRangeDTO> getUnavailableDateRanges(Long vehicleId);

    VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO request);

    VehicleResponseDTO updateVehicleStatus(Long id, VehicleStatus status);

    void deleteVehicle(Long id);
}
