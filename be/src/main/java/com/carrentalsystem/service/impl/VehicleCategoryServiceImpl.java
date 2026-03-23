package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.vehiclecategory.VehicleCategoryRequestDTO;
import com.carrentalsystem.dto.vehiclecategory.VehicleCategoryResponseDTO;
import com.carrentalsystem.entity.PricingEntity;
import com.carrentalsystem.entity.VehicleCategoryEntity;
import com.carrentalsystem.entity.VehicleCategoryImageEntity;
import com.carrentalsystem.entity.VehicleStatus;
import com.carrentalsystem.exception.DuplicateResourceException;
import com.carrentalsystem.exception.ResourceNotFoundException;
import com.carrentalsystem.repository.PricingRepository;
import com.carrentalsystem.repository.VehicleCategoryRepository;
import com.carrentalsystem.repository.VehicleRepository;
import com.carrentalsystem.service.VehicleCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleCategoryServiceImpl implements VehicleCategoryService {

    private final VehicleCategoryRepository categoryRepository;
    private final PricingRepository pricingRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    @Transactional
    public VehicleCategoryResponseDTO createCategory(VehicleCategoryRequestDTO request) {
        log.info("Creating category: {} {} {}", request.getBrand(), request.getName(), request.getModel());

        if (categoryRepository.existsByBrandAndNameAndModel(request.getBrand(), request.getName(),
                request.getModel())) {
            throw new DuplicateResourceException("VehicleCategory", "brand+name+model",
                    request.getBrand() + " " + request.getName() + " " + request.getModel());
        }

        // Create category entity
        VehicleCategoryEntity category = VehicleCategoryEntity.builder()
                .brand(request.getBrand())
                .name(request.getName())
                .model(request.getModel())
                .seats(request.getSeats())
                .batteryCapacityKwh(request.getBatteryCapacityKwh())
                .rangeKm(request.getRangeKm())
                .chargingTimeHours(request.getChargingTimeHours())
                .description(request.getDescription())
                .build();

        // Add images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                VehicleCategoryImageEntity image = VehicleCategoryImageEntity.builder()
                        .vehicleCategory(category)
                        .imageUrl(request.getImageUrls().get(i))
                        .isPrimary(i == 0)
                        .sortOrder(i)
                        .build();
                category.getImages().add(image);
            }
        }

        VehicleCategoryEntity saved = categoryRepository.save(category);

        // Create pricing
        PricingEntity pricing = PricingEntity.builder()
                .vehicleCategory(saved)
                .dailyPrice(request.getDailyPrice())
                .weeklyPrice(request.getWeeklyPrice())
                .monthlyPrice(request.getMonthlyPrice())
                .overtimeFeePerHour(request.getOvertimeFeePerHour())
                .effectiveFrom(LocalDate.now())
                .isActive(true)
                .build();
        pricingRepository.save(pricing);

        log.info("Category created with ID: {}", saved.getId());
        return toResponseDTO(saved, pricing, 0, 0);
    }

    @Override
    public VehicleCategoryResponseDTO getCategoryById(Long id) {
        VehicleCategoryEntity category = categoryRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleCategory", "id", id));

        PricingEntity pricing = pricingRepository.findCurrentPricingByCategory(id).orElse(null);
        long totalVehicles = vehicleRepository.countByVehicleCategoryId(id);
        long availableVehicles = vehicleRepository.countByVehicleCategoryIdAndStatus(id, VehicleStatus.AVAILABLE);

        return toResponseDTO(category, pricing, (int) totalVehicles, (int) availableVehicles);
    }

    @Override
    public List<VehicleCategoryResponseDTO> getAllCategories() {
        List<VehicleCategoryEntity> categories = categoryRepository.findAllWithImages();

        // Batch fetch all active pricing
        List<PricingEntity> allPricings = pricingRepository.findAllCurrentPricings();
        Map<Long, PricingEntity> pricingMap = allPricings.stream()
                .collect(Collectors.toMap(
                        p -> p.getVehicleCategory().getId(),
                        p -> p,
                        (existing, replacement) -> existing));

        // Batch fetch vehicle counts by category (avoid N+1 count queries)
        Map<Long, VehicleRepository.VehicleCategoryCountProjection> countMap = vehicleRepository
                .countVehiclesByCategory(VehicleStatus.AVAILABLE)
                .stream()
                .collect(Collectors.toMap(
                        VehicleRepository.VehicleCategoryCountProjection::getCategoryId,
                        c -> c,
                        (existing, replacement) -> existing));

        return categories.stream()
                .map(cat -> {
                    PricingEntity pricing = pricingMap.get(cat.getId());
                    VehicleRepository.VehicleCategoryCountProjection counts = countMap.get(cat.getId());
                    long totalVehicles = counts != null && counts.getTotalCount() != null ? counts.getTotalCount() : 0L;
                    long availableVehicles = counts != null && counts.getAvailableCount() != null
                            ? counts.getAvailableCount()
                            : 0L;
                    return toResponseDTO(cat, pricing, (int) totalVehicles, (int) availableVehicles);
                })
                .toList();
    }

    @Override
    @Transactional
    public VehicleCategoryResponseDTO updateCategory(Long id, VehicleCategoryRequestDTO request) {
        log.info("Updating category ID: {}", id);

        VehicleCategoryEntity category = categoryRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleCategory", "id", id));

        // Check duplicate (if brand/name/model changed)
        if (!category.getBrand().equals(request.getBrand()) ||
                !category.getName().equals(request.getName()) ||
                !category.getModel().equals(request.getModel())) {
            if (categoryRepository.existsByBrandAndNameAndModel(request.getBrand(), request.getName(),
                    request.getModel())) {
                throw new DuplicateResourceException("VehicleCategory", "brand+name+model",
                        request.getBrand() + " " + request.getName() + " " + request.getModel());
            }
        }

        // Update fields
        category.setBrand(request.getBrand());
        category.setName(request.getName());
        category.setModel(request.getModel());
        category.setSeats(request.getSeats());
        category.setBatteryCapacityKwh(request.getBatteryCapacityKwh());
        category.setRangeKm(request.getRangeKm());
        category.setChargingTimeHours(request.getChargingTimeHours());
        category.setDescription(request.getDescription());

        // Update images (replace all)
        category.getImages().clear();
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                VehicleCategoryImageEntity image = VehicleCategoryImageEntity.builder()
                        .vehicleCategory(category)
                        .imageUrl(request.getImageUrls().get(i))
                        .isPrimary(i == 0)
                        .sortOrder(i)
                        .build();
                category.getImages().add(image);
            }
        }

        VehicleCategoryEntity saved = categoryRepository.save(category);

        // Update or create pricing
        PricingEntity pricing = pricingRepository.findCurrentPricingByCategory(id).orElse(null);
        if (pricing != null) {
            pricing.setDailyPrice(request.getDailyPrice());
            pricing.setWeeklyPrice(request.getWeeklyPrice());
            pricing.setMonthlyPrice(request.getMonthlyPrice());
            pricing.setOvertimeFeePerHour(request.getOvertimeFeePerHour());
            pricingRepository.save(pricing);
        } else {
            pricing = PricingEntity.builder()
                    .vehicleCategory(saved)
                    .dailyPrice(request.getDailyPrice())
                    .weeklyPrice(request.getWeeklyPrice())
                    .monthlyPrice(request.getMonthlyPrice())
                    .overtimeFeePerHour(request.getOvertimeFeePerHour())
                    .effectiveFrom(LocalDate.now())
                    .isActive(true)
                    .build();
            pricingRepository.save(pricing);
        }

        long totalVehicles = vehicleRepository.countByVehicleCategoryId(id);
        long availableVehicles = vehicleRepository.countByVehicleCategoryIdAndStatus(id, VehicleStatus.AVAILABLE);

        log.info("Category ID: {} updated", id);
        return toResponseDTO(saved, pricing, (int) totalVehicles, (int) availableVehicles);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category ID: {}", id);

        VehicleCategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleCategory", "id", id));

        long vehicleCount = vehicleRepository.countByVehicleCategoryId(id);
        if (vehicleCount > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete category with " + vehicleCount + " vehicles assigned to it");
        }

        categoryRepository.delete(category);
        log.info("Category ID: {} deleted", id);
    }

    @Override
    public List<String> getAllBrands() {
        return categoryRepository.findAllBrands();
    }

    /**
     * Convert entity + pricing to response DTO
     */
    private VehicleCategoryResponseDTO toResponseDTO(VehicleCategoryEntity entity, PricingEntity pricing,
            int vehicleCount, int availableCount) {
        List<String> imageUrls = new ArrayList<>();
        String primaryImageUrl = null;

        if (entity.getImages() != null) {
            for (VehicleCategoryImageEntity img : entity.getImages()) {
                imageUrls.add(img.getImageUrl());
                if (Boolean.TRUE.equals(img.getIsPrimary())) {
                    primaryImageUrl = img.getImageUrl();
                }
            }
            if (primaryImageUrl == null && !imageUrls.isEmpty()) {
                primaryImageUrl = imageUrls.get(0);
            }
        }

        return VehicleCategoryResponseDTO.builder()
                .id(entity.getId())
                .brand(entity.getBrand())
                .name(entity.getName())
                .model(entity.getModel())
                .seats(entity.getSeats())
                .batteryCapacityKwh(entity.getBatteryCapacityKwh())
                .rangeKm(entity.getRangeKm())
                .chargingTimeHours(entity.getChargingTimeHours())
                .description(entity.getDescription())
                .imageUrls(imageUrls)
                .primaryImageUrl(primaryImageUrl)
                .dailyPrice(pricing != null ? pricing.getDailyPrice() : null)
                .weeklyPrice(pricing != null ? pricing.getWeeklyPrice() : null)
                .monthlyPrice(pricing != null ? pricing.getMonthlyPrice() : null)
                .overtimeFeePerHour(pricing != null ? pricing.getOvertimeFeePerHour() : null)
                .vehicleCount(vehicleCount)
                .availableCount(availableCount)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
