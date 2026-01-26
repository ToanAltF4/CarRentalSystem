-- CarRentalSystem - Complete Database Schema
-- Consolidated Migration V1 - FIXED: bookings table has pickup_method_id as INT

-- ================== VEHICLES SYSTEM ==================

-- Vehicle Categories
CREATE TABLE vehicle_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pricing
CREATE TABLE pricing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_category_id BIGINT NOT NULL,
    daily_price DECIMAL(10,2) NOT NULL,
    weekly_price DECIMAL(10,2),
    monthly_price DECIMAL(10,2),
    overtime_fee_per_hour DECIMAL(8,2) DEFAULT 10.00,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pricing_category FOREIGN KEY (vehicle_category_id) 
        REFERENCES vehicle_categories(id) ON DELETE CASCADE,
    INDEX idx_pricing_category (vehicle_category_id),
    INDEX idx_pricing_active (is_active, effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicles
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    battery_capacity_kwh DECIMAL(5,2),
    range_km INT,
    charging_time_hours DECIMAL(4,2),
    daily_rate DECIMAL(10,2) NOT NULL,
    status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE') DEFAULT 'AVAILABLE',
    image_url VARCHAR(500),
    category_id BIGINT,
    seats INT DEFAULT 5,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_vehicle_category FOREIGN KEY (category_id) 
        REFERENCES vehicle_categories(id) ON DELETE SET NULL,
    INDEX idx_vehicles_status (status),
    INDEX idx_vehicles_brand (brand),
    INDEX idx_vehicles_name_model (name, model),
    INDEX idx_vehicles_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================== AUTHENTICATION SYSTEM ==================

-- Roles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    license_number VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    role_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_status (status),
    INDEX idx_users_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    token VARCHAR(500),
    expiry_date TIMESTAMP,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_refresh_tokens_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE,
    INDEX idx_refresh_tokens_user (user_id),
    INDEX idx_refresh_tokens_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================== BOOKING SYSTEM ==================

-- Bookings (ĐÃ SỬA: THÊM pickup_method_id LÀ INT)
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    vehicle_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    
    -- QUAN TRỌNG: Thêm cột này với kiểu INT để khớp với Java Integer
    pickup_method_id INT, 
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id) 
        REFERENCES vehicles(id) ON DELETE RESTRICT,
    INDEX idx_booking_vehicle (vehicle_id),
    INDEX idx_booking_dates (start_date, end_date),
    INDEX idx_booking_status (status),
    INDEX idx_booking_code (booking_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================== RETURN & INSPECTION SYSTEM ==================

-- Inspections
CREATE TABLE inspections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    battery_level INT NOT NULL,
    odometer INT NOT NULL,
    charging_cable_present BOOLEAN DEFAULT TRUE,
    exterior_condition ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED') DEFAULT 'GOOD',
    interior_condition ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED') DEFAULT 'GOOD',
    has_damage BOOLEAN DEFAULT FALSE,
    damage_description TEXT,
    damage_photos TEXT,
    inspected_by VARCHAR(100),
    inspection_notes TEXT,
    inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_inspection_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) ON DELETE RESTRICT,
    INDEX idx_inspection_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL UNIQUE,
    inspection_id BIGINT,
    rental_fee DECIMAL(12,2) NOT NULL,
    overtime_hours INT DEFAULT 0,
    overtime_fee DECIMAL(10,2) DEFAULT 0.00,
    damage_fee DECIMAL(10,2) DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED') DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    paid_at TIMESTAMP NULL,
    actual_return_date TIMESTAMP NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_invoice_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoice_inspection FOREIGN KEY (inspection_id) 
        REFERENCES inspections(id) ON DELETE SET NULL,
    INDEX idx_invoice_booking (booking_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_invoice_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================== INITIAL DATA ==================

INSERT INTO roles (role_name, description) VALUES
    ('ROLE_CUSTOMER', 'Regular customers who rent vehicles'),
    ('ROLE_ADMIN', 'System administrators with full access'),
    ('ROLE_STAFF', 'Staff members for vehicle and booking management');

INSERT INTO vehicle_categories (name, description) VALUES 
    ('ECONOMY', 'Budget-friendly electric vehicles'),
    ('STANDARD', 'Mid-range electric vehicles'),
    ('PREMIUM', 'High-end electric vehicles'),
    ('LUXURY', 'Luxury electric vehicles'),
    ('Sedan', 'Standard 4-door car'),
    ('SUV', 'Sports Utility Vehicle');

INSERT INTO pricing (vehicle_category_id, daily_price, weekly_price, monthly_price, overtime_fee_per_hour, effective_from, is_active) VALUES
    (1, 50.00, 300.00, 1000.00, 5.00, '2024-01-01', TRUE),
    (2, 80.00, 500.00, 1800.00, 8.00, '2024-01-01', TRUE),
    (3, 120.00, 750.00, 2800.00, 12.00, '2024-01-01', TRUE),
    (4, 200.00, 1200.00, 4500.00, 20.00, '2024-01-01', TRUE);