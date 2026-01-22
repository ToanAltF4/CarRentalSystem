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
     * Search by keyword in name, model, or brand (case-insensitive)
     */
    public static Specification<VehicleEntity> containsKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("model")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("brand")), pattern));
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
     * Filter by brand (case-insensitive)
     */
    public static Specification<VehicleEntity> hasBrand(String brand) {
        return (root, query, criteriaBuilder) -> {
            if (brand == null || brand.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(criteriaBuilder.lower(root.get("brand")), brand.toLowerCase());
        };
    }

    /**
     * Filter by minimum range
     */
    public static Specification<VehicleEntity> hasMinRange(Integer minRange) {
        return (root, query, criteriaBuilder) -> {
            if (minRange == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("rangeKm"), minRange);
        };
    }

    /**
     * Filter by maximum daily rate
     */
    public static Specification<VehicleEntity> hasMaxDailyRate(java.math.BigDecimal maxRate) {
        return (root, query, criteriaBuilder) -> {
            if (maxRate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("dailyRate"), maxRate);
        };
    }
}
