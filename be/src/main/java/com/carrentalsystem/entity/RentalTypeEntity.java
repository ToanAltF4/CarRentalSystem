package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing rental types (e.g., SELF_DRIVE, WITH_DRIVER).
 */
@Entity
@Table(name = "rental_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 255)
    private String description;
}
