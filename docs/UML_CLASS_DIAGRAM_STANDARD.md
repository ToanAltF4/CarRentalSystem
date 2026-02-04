# Car Rental System - UML Class Diagram (Chuẩn UML 2.0)

## 📊 Class Diagram

```mermaid
classDiagram
    direction TB
    
    %% ═══════════════════════════════════════════════════════════
    %% CORE ENTITIES
    %% ═══════════════════════════════════════════════════════════
    
    class UserEntity {
        -Long id
        -String fullName
        -String email
        -String password
        -String status
        -String licenseType
        -String licenseNumber
        -LocalDate dateOfBirth
        -String licenseFrontImageUrl
        -LicenseStatus licenseStatus
        +getId() Long
        +getEmail() String
    }
    
    class RoleEntity {
        -Long id
        -String roleName
        -String description
        +getId() Long
        +getRoleName() String
    }
    
    class VehicleEntity {
        -Long id
        -String name
        -String model
        -String brand
        -String licensePlate
        -BigDecimal batteryCapacityKwh
        -Integer rangeKm
        -BigDecimal chargingTimeHours
        -BigDecimal dailyRate
        -VehicleStatus status
        -String imageUrl
        -Integer seats
        -String description
        +getId() Long
        +getDailyRate() BigDecimal
    }
    
    class VehicleCategoryEntity {
        -Long id
        -String name
        -String description
        +getId() Long
        +getName() String
    }
    
    %% ═══════════════════════════════════════════════════════════
    %% DRIVER ENTITIES
    %% ═══════════════════════════════════════════════════════════
    
    class DriverEntity {
        -Long id
        -String fullName
        -String phone
        -String status
        +getId() Long
        +getFullName() String
    }
    
    class DriverPricingEntity {
        -Long id
        -BigDecimal dailyFee
        -LocalDate effectiveFrom
        -LocalDate effectiveTo
        -Boolean isActive
        +getDailyFee() BigDecimal
    }
    
    %% ═══════════════════════════════════════════════════════════
    %% BOOKING ENTITIES
    %% ═══════════════════════════════════════════════════════════
    
    class BookingEntity {
        -Long id
        -String bookingCode
        -Long driverId
        -String customerName
        -String customerEmail
        -String customerPhone
        -LocalDate startDate
        -LocalDate endDate
        -Integer totalDays
        -BigDecimal dailyRate
        -BigDecimal rentalFee
        -BigDecimal driverFee
        -BigDecimal deliveryFee
        -String deliveryAddress
        -BigDecimal totalAmount
        -BookingStatus status
        -String notes
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +calculateTotalAmount() BigDecimal
        +getTotalDays() Integer
    }
    
    class RentalTypeEntity {
        -Integer id
        -String name
        -String description
        +getId() Integer
        +getName() String
    }
    
    class PickupMethodEntity {
        -Integer id
        -String name
        -String description
        +getId() Integer
        +getName() String
    }
    
    class InspectionEntity {
        -Long id
        -InspectionType type
        -Integer batteryLevel
        -Integer odometer
        -Boolean chargingCablePresent
        -ConditionRating exteriorCondition
        -ConditionRating interiorCondition
        -Boolean hasDamage
        -String damageDescription
        -String damagePhotos
        -Long inspectedById
        -LocalDateTime inspectedAt
        +hasDamage() Boolean
    }
    
    class InvoiceEntity {
        -Long id
        -String invoiceNumber
        -BigDecimal rentalFee
        -BigDecimal driverFee
        -BigDecimal damageFee
        -BigDecimal deliveryFee
        -BigDecimal totalAmount
        -PaymentStatus paymentStatus
        +getTotalAmount() BigDecimal
    }
    
    %% ═══════════════════════════════════════════════════════════
    %% PRICING ENTITIES
    %% ═══════════════════════════════════════════════════════════
    
    class PricingEntity {
        -Long id
        -BigDecimal dailyPrice
        -BigDecimal weeklyPrice
        -BigDecimal monthlyPrice
        -LocalDate effectiveFrom
        -LocalDate effectiveTo
        -BigDecimal overtimeFeePerHour
        -Boolean isActive
        +getDailyPrice() BigDecimal
    }
    
    class DeliveryPricingEntity {
        -Long id
        -BigDecimal baseFee
        -LocalDate effectiveFrom
        -LocalDate effectiveTo
        -Boolean isActive
        +getBaseFee() BigDecimal
    }
    
    %% ═══════════════════════════════════════════════════════════
    %% PAYMENT ENTITIES
    %% ═══════════════════════════════════════════════════════════
    
    class PaymentMethodEntity {
        -Integer id
        -String name
        -String description
        +getName() String
    }
    
    class PaymentEntity {
        -Long id
        -BigDecimal amount
        -PaymentStatus paymentStatus
        +getAmount() BigDecimal
    }
    
    %% ═══════════════════════════════════════════════════════════
    %% AUTHENTICATION ENTITIES
    %% ═══════════════════════════════════════════════════════════
    
    class RefreshTokenEntity {
        -Long id
        -String token
        -Instant expiryDate
        +isExpired() Boolean
    }
    
    class OtpEntity {
        -Long id
        -String email
        -String otpCode
        -LocalDateTime expiresAt
        -Boolean verified
        -LocalDateTime createdAt
        +isExpired() Boolean
        +isVerified() Boolean
    }
    
    class PasswordResetTokenEntity {
        -Long id
        -String email
        -String token
        -LocalDateTime expiresAt
        -Boolean used
        -LocalDateTime createdAt
        +isExpired() Boolean
    }
    
    %% ═══════════════════════════════════════════════════════════
    %% ENUMERATIONS
    %% ═══════════════════════════════════════════════════════════
    
    class BookingStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        IN_PROGRESS
        COMPLETED
        CANCELLED
    }
    
    class VehicleStatus {
        <<enumeration>>
        AVAILABLE
        RENTED
        MAINTENANCE
    }
    
    class PaymentStatus {
        <<enumeration>>
        PENDING
        PAID
        FAILED
    }
    
    class LicenseStatus {
        <<enumeration>>
        PENDING
        VERIFIED
        REJECTED
    }
    
    class ConditionRating {
        <<enumeration>>
        EXCELLENT
        GOOD
        FAIR
        POOR
    }
    
    class InspectionType {
        <<enumeration>>
        PICKUP
        RETURN
    }
    
    %% ═══════════════════════════════════════════════════════════
    %% RELATIONSHIPS (UML Standard Notation)
    %% ═══════════════════════════════════════════════════════════
    
    %% User relationships
    UserEntity "1" --> "1" RoleEntity : has role
    UserEntity "1" -- "0..1" RefreshTokenEntity : has token
    
    %% Vehicle relationships
    VehicleEntity "*" --> "1" VehicleCategoryEntity : belongs to
    VehicleCategoryEntity "1" o-- "*" PricingEntity : has pricing
    
    %% Booking relationships (core)
    BookingEntity "*" --> "1" VehicleEntity : rents
    BookingEntity "*" --> "0..1" UserEntity : placed by
    BookingEntity "*" --> "1" RentalTypeEntity : has type
    BookingEntity "*" --> "1" PickupMethodEntity : has method
    BookingEntity "*" --> "0..1" DriverEntity : assigned driver
    
    %% Inspection & Invoice
    InspectionEntity "*" --> "1" BookingEntity : inspects
    InvoiceEntity "1" -- "1" BookingEntity : invoices
    
    %% Payment
    PaymentEntity "*" --> "1" InvoiceEntity : pays
    PaymentEntity "*" --> "1" PaymentMethodEntity : uses
    
    %% Enum usage (dashed lines)
    BookingEntity ..> BookingStatus : uses
    VehicleEntity ..> VehicleStatus : uses
    InvoiceEntity ..> PaymentStatus : uses
    PaymentEntity ..> PaymentStatus : uses
    UserEntity ..> LicenseStatus : uses
    InspectionEntity ..> InspectionType : uses
    InspectionEntity ..> ConditionRating : uses
```

---

## 📋 UML Notation Guide (Ký hiệu UML Chuẩn)

### Class Box Structure (Cấu trúc hộp Class)

```
┌─────────────────────────────────┐
│         <<stereotype>>          │  ← Stereotype (optional)
│          ClassName              │  ← Tên Class (bold)
├─────────────────────────────────┤
│ - privateAttribute: Type        │  ← Attributes
│ # protectedAttribute: Type      │     - private
│ + publicAttribute: Type         │     # protected
│                                 │     + public
├─────────────────────────────────┤
│ + publicMethod(): ReturnType    │  ← Methods
│ - privateMethod(): void         │
└─────────────────────────────────┘
```

### Visibility Symbols (Ký hiệu truy cập)

| Symbol | Meaning | Mô tả |
|--------|---------|-------|
| `+` | public | Truy cập từ mọi nơi |
| `-` | private | Chỉ truy cập trong class |
| `#` | protected | Truy cập từ class và subclass |
| `~` | package | Truy cập trong cùng package |

### Relationship Notation (Ký hiệu quan hệ)

| Notation | Name | Mô tả |
|----------|------|-------|
| `───────>` | Association | Quan hệ liên kết đơn hướng |
| `────────` | Association | Quan hệ liên kết hai hướng |
| `◇───────` | Aggregation | "Has-a" relationship (các phần có thể tồn tại độc lập) |
| `◆───────` | Composition | "Owns" relationship (các phần phụ thuộc hoàn toàn) |
| `─ ─ ─ ─>` | Dependency | Quan hệ phụ thuộc (dashed) |
| `────▷` | Inheritance | Kế thừa (hollow triangle) |
| `- - -▷` | Implementation | Triển khai interface |

### Multiplicity (Bội số)

| Notation | Meaning | Mô tả |
|----------|---------|-------|
| `1` | Exactly one | Chính xác 1 |
| `0..1` | Zero or one | 0 hoặc 1 (optional) |
| `*` | Zero or more | 0 hoặc nhiều |
| `1..*` | One or more | 1 hoặc nhiều |
| `n..m` | Range | Từ n đến m |

---

## 🔗 Relationships Detail

### Core Relationships

```
UserEntity (1) ─────────────────────────> (1) RoleEntity
    │                                         
    │ Mỗi User có đúng 1 Role
    │

UserEntity (1) ─────────────────────── (0..1) RefreshTokenEntity
    │
    │ Mỗi User có tối đa 1 RefreshToken (single session)
    │

VehicleEntity (*) ─────────────────────> (1) VehicleCategoryEntity
    │
    │ Nhiều Vehicle thuộc 1 Category
    │

VehicleCategoryEntity (1) ◇───────────── (*) PricingEntity
    │
    │ 1 Category có nhiều Pricing (Aggregation)
    │ Pricing có thể tồn tại độc lập
```

### Booking Relationships

```
BookingEntity (*) ─────────────────────> (1) VehicleEntity
    │
    │ Nhiều Booking cho 1 Vehicle

BookingEntity (*) ─────────────────────> (0..1) UserEntity  
    │
    │ Booking có thể có hoặc không liên kết User

BookingEntity (*) ─────────────────────> (1) RentalTypeEntity
    │
    │ Mỗi Booking có 1 loại thuê (SELF_DRIVE / WITH_DRIVER)

BookingEntity (*) ─────────────────────> (0..1) DriverEntity
    │
    │ Booking có tài xế (optional, chỉ khi WITH_DRIVER)

InspectionEntity (*) ─────────────────────> (1) BookingEntity
    │
    │ Mỗi Booking có 2 Inspection (PICKUP + RETURN)

InvoiceEntity (1) ────────────────────── (1) BookingEntity
    │
    │ Mỗi Booking có đúng 1 Invoice (One-to-One)
```

---

## 💰 Pricing Logic (UML Activity)

```
┌─────────────────────────────────────────────────────────────┐
│                 CALCULATE TOTAL AMOUNT                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ●─────> [Get Rental Type]                                  │
│              │                                              │
│              ├──[SELF_DRIVE]──┐                             │
│              │                │                             │
│              │                ▼                             │
│              │    rental_fee = daily_rate × total_days      │
│              │    driver_fee = 0                            │
│              │                │                             │
│              ├──[WITH_DRIVER]─┤                             │
│              │                │                             │
│              │                ▼                             │
│              │    rental_fee = daily_rate × total_days      │
│              │    driver_fee = daily_driver_fee × total_days│
│              │                │                             │
│              └────────────────┼─────────────────────────────│
│                               ▼                             │
│               [Get Pickup Method]                           │
│                      │                                      │
│              ┌───────┴───────┐                              │
│              │               │                              │
│         [AT_STORE]      [DELIVERY]                          │
│              │               │                              │
│              ▼               ▼                              │
│    delivery_fee = 0    delivery_fee = base_fee              │
│              │               │                              │
│              └───────┬───────┘                              │
│                      ▼                                      │
│    total_amount = rental_fee + driver_fee + delivery_fee    │
│                      │                                      │
│                      ▼                                      │
│                      ◉                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 Version Info

| Property | Value |
|----------|-------|
| **UML Version** | 2.0 |
| **Created** | 2026-02-04 |
| **Author** | Auto-generated |
| **Standard** | OMG UML Specification |
