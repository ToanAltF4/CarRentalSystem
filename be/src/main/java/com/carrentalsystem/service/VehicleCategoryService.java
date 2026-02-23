package com.carrentalsystem.service;

import com.carrentalsystem.dto.vehiclecategory.VehicleCategoryRequestDTO;
import com.carrentalsystem.dto.vehiclecategory.VehicleCategoryResponseDTO;

import java.util.List;

/**
 * Service interface for Vehicle Category operations.
 */
public interface VehicleCategoryService {

    VehicleCategoryResponseDTO createCategory(VehicleCategoryRequestDTO request);

    VehicleCategoryResponseDTO getCategoryById(Long id);

    List<VehicleCategoryResponseDTO> getAllCategories();

    VehicleCategoryResponseDTO updateCategory(Long id, VehicleCategoryRequestDTO request);

    void deleteCategory(Long id);

    List<String> getAllBrands();
}
