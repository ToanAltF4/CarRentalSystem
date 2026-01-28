package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing pickup methods (e.g., AT_STORE, DELIVERY).
 */
@Entity
@Table(name = "pickup_methods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupMethodEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 255)
    private String description;
}
