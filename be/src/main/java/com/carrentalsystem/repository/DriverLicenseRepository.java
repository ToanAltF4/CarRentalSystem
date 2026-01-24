package com.carrentalsystem.repository;

import com.carrentalsystem.entity.DriverLicenseEntity;
import com.carrentalsystem.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverLicenseRepository extends JpaRepository<DriverLicenseEntity, Long> {

    Optional<DriverLicenseEntity> findByUser(UserEntity user);

    Optional<DriverLicenseEntity> findByUserId(Long userId);
}
