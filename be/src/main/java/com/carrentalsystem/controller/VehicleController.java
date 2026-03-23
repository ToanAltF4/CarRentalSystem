package com.carrentalsystem.controller;

import com.carrentalsystem.dto.vehicle.VehicleRequestDTO;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.dto.vehicle.VehicleUnavailableDateRangeDTO;
import com.carrentalsystem.entity.VehicleStatus;
import com.carrentalsystem.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Vehicle (physical car) management.
 */
@RestController
@RequestMapping({"/api/v1/vehicles", "/api/vehicles"})
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Physical Vehicle (Car) Management API")
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new vehicle", description = "Add a new physical car to the fleet linked to a category")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Vehicle created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Vehicle with license plate/VIN already exists")
    })
    public ResponseEntity<VehicleResponseDTO> createVehicle(
            @Valid @RequestBody VehicleRequestDTO request) {
        VehicleResponseDTO response = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle by ID")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(
            @Parameter(description = "Vehicle ID") @PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping
    @Operation(summary = "Get all vehicles")
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/search")
    @Operation(summary = "Search vehicles", description = "Search by license plate, VIN, or category brand/name")
    public ResponseEntity<List<VehicleResponseDTO>> searchVehicles(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(vehicleService.searchVehicles(keyword));
    }

    @GetMapping("/available")
    @Operation(summary = "Get available vehicles")
    public ResponseEntity<List<VehicleResponseDTO>> getAvailableVehicles(
            @Parameter(description = "Start date (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles(startDate, endDate));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get vehicles by category")
    public ResponseEntity<List<VehicleResponseDTO>> getVehiclesByCategory(
            @Parameter(description = "Vehicle category ID") @PathVariable Long categoryId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByCategory(categoryId));
    }

    @GetMapping("/{id}/unavailable-dates")
    @Operation(summary = "Get unavailable date ranges for vehicle")
    public ResponseEntity<List<VehicleUnavailableDateRangeDTO>> getUnavailableDateRanges(
            @Parameter(description = "Vehicle ID") @PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getUnavailableDateRanges(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update vehicle", description = "Update a physical vehicle's details")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @Parameter(description = "Vehicle ID") @PathVariable Long id,
            @Valid @RequestBody VehicleRequestDTO request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    @Operation(summary = "Update vehicle status")
    public ResponseEntity<VehicleResponseDTO> updateVehicleStatus(
            @Parameter(description = "Vehicle ID") @PathVariable Long id,
            @Parameter(description = "New status") @RequestParam VehicleStatus status) {
        return ResponseEntity.ok(vehicleService.updateVehicleStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete vehicle")
    public ResponseEntity<Void> deleteVehicle(
            @Parameter(description = "Vehicle ID") @PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
