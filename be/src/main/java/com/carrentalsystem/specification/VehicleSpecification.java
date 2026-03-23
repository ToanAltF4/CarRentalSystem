package com.carrentalsystem.specification;

import com.carrentalsystem.entity.VehicleEntity;
import com.carrentalsystem.entity.VehicleStatus;
import org.springframework.data.jpa.domain.Specification;

/**
 * JPA Specifications for dynamic Vehicle queries.
 */
public class VehicleSpecification {

    private VehicleSpecification() {
        // Utility class
    }

    /**
     * Search by keyword in license plate, VIN, or category brand/name
     * (case-insensitive)
     */
    public static Specification<VehicleEntity> containsKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("licensePlate")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("vin")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("vehicleCategory").get("brand")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("vehicleCategory").get("name")), pattern));
        };
    }

    /**
     * Filter by status
     */
    public static Specification<VehicleEntity> hasStatus(VehicleStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    /**
     * Filter by category ID
     */
    public static Specification<VehicleEntity> hasCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            if (categoryId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("vehicleCategory").get("id"), categoryId);
        };
    }
}
