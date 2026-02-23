package com.carrentalsystem.controller;

import com.carrentalsystem.dto.vehiclecategory.VehicleCategoryRequestDTO;
import com.carrentalsystem.dto.vehiclecategory.VehicleCategoryResponseDTO;
import com.carrentalsystem.service.VehicleCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Vehicle Category (model catalog) management.
 */
@RestController
@RequestMapping({"/api/v1/vehicle-categories", "/api/vehicle-categories"})
@RequiredArgsConstructor
@Tag(name = "Vehicle Categories", description = "Vehicle Category (Model Catalog) Management API")
public class VehicleCategoryController {

    private final VehicleCategoryService vehicleCategoryService;

    @GetMapping
    @Operation(summary = "Get all vehicle categories", description = "Retrieve all vehicle categories with pricing info")
    public ResponseEntity<List<VehicleCategoryResponseDTO>> getAllCategories() {
        return ResponseEntity.ok(vehicleCategoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<VehicleCategoryResponseDTO> getCategoryById(
            @Parameter(description = "Category ID") @PathVariable Long id) {
        return ResponseEntity.ok(vehicleCategoryService.getCategoryById(id));
    }

    @GetMapping("/brands")
    @Operation(summary = "Get all brands")
    public ResponseEntity<List<String>> getAllBrands() {
        return ResponseEntity.ok(vehicleCategoryService.getAllBrands());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new vehicle category", description = "Create a new vehicle model/variant with pricing")
    public ResponseEntity<VehicleCategoryResponseDTO> createCategory(
            @Valid @RequestBody VehicleCategoryRequestDTO request) {
        VehicleCategoryResponseDTO response = vehicleCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update vehicle category")
    public ResponseEntity<VehicleCategoryResponseDTO> updateCategory(
            @Parameter(description = "Category ID") @PathVariable Long id,
            @Valid @RequestBody VehicleCategoryRequestDTO request) {
        return ResponseEntity.ok(vehicleCategoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete vehicle category")
    public ResponseEntity<Void> deleteCategory(
            @Parameter(description = "Category ID") @PathVariable Long id) {
        vehicleCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
