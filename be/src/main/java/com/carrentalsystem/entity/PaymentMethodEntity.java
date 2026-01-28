package com.carrentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing payment methods (e.g., CASH, VNPAY, MOMO).
 */
@Entity
@Table(name = "payment_methods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 255)
    private String description;
}
