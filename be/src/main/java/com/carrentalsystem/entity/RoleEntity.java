package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * JPA Entity representing a role in the EV Fleet Car Rental System.
 * Defines user roles for authorization and access control.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private String roleName; // ROLE_CUSTOMER, ROLE_ADMIN, ROLE_STAFF

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
