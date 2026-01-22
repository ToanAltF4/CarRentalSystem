package com.carrentalsystem.repository;

import com.carrentalsystem.entity.InspectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Inspection operations.
 */
@Repository
public interface InspectionRepository extends JpaRepository<InspectionEntity, Long> {

    Optional<InspectionEntity> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);
}
