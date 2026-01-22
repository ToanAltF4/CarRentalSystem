-- Vehicle Categories for pricing tiers
CREATE TABLE vehicle_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pricing table based on vehicle category
CREATE TABLE pricing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_category_id BIGINT NOT NULL,
    daily_price DECIMAL(10,2) NOT NULL,
    weekly_price DECIMAL(10,2),
    monthly_price DECIMAL(10,2),
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

-- Add category_id to vehicles table
ALTER TABLE vehicles 
ADD COLUMN category_id BIGINT,
ADD CONSTRAINT fk_vehicle_category FOREIGN KEY (category_id) 
    REFERENCES vehicle_categories(id) ON DELETE SET NULL;

-- Bookings table
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

-- Insert default categories
INSERT INTO vehicle_categories (name, description) VALUES 
('ECONOMY', 'Budget-friendly electric vehicles'),
('STANDARD', 'Mid-range electric vehicles'),
('PREMIUM', 'High-end electric vehicles'),
('LUXURY', 'Luxury electric vehicles');

-- Insert default pricing
INSERT INTO pricing (vehicle_category_id, daily_price, weekly_price, monthly_price, effective_from, is_active) VALUES
(1, 50.00, 300.00, 1000.00, '2024-01-01', TRUE),
(2, 80.00, 500.00, 1800.00, '2024-01-01', TRUE),
(3, 120.00, 750.00, 2800.00, '2024-01-01', TRUE),
(4, 200.00, 1200.00, 4500.00, '2024-01-01', TRUE);
