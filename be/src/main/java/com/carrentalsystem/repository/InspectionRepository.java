package com.carrentalsystem.repository;

import com.carrentalsystem.entity.InspectionEntity;
import com.carrentalsystem.entity.InspectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<InspectionEntity, Long> {

    List<InspectionEntity> findByBookingId(Long bookingId);

    Optional<InspectionEntity> findByBookingIdAndType(Long bookingId, InspectionType type);

    List<InspectionEntity> findByInspectedById(Long staffId);

    boolean existsByBookingIdAndType(Long bookingId, InspectionType type);
}
