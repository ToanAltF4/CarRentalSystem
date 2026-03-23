package com.carrentalsystem.repository;

import com.carrentalsystem.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for RoleEntity operations.
 */
@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {

    /**
     * Find role by role name
     */
    Optional<RoleEntity> findByRoleName(String roleName);
}
