-- Add overtime fee to pricing table
ALTER TABLE pricing 
ADD COLUMN overtime_fee_per_hour DECIMAL(8,2) DEFAULT 10.00;

-- Update existing pricing with default overtime fees
UPDATE pricing SET overtime_fee_per_hour = 
    CASE 
        WHEN vehicle_category_id = 1 THEN 5.00   -- Economy
        WHEN vehicle_category_id = 2 THEN 8.00   -- Standard
        WHEN vehicle_category_id = 3 THEN 12.00  -- Premium
        WHEN vehicle_category_id = 4 THEN 20.00  -- Luxury
        ELSE 10.00
    END;

-- Inspections table - records vehicle condition at return
CREATE TABLE inspections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    
    -- Vehicle condition
    battery_level INT NOT NULL,
    odometer INT NOT NULL,
    charging_cable_present BOOLEAN DEFAULT TRUE,
    exterior_condition ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED') DEFAULT 'GOOD',
    interior_condition ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED') DEFAULT 'GOOD',
    
    -- Damage details
    has_damage BOOLEAN DEFAULT FALSE,
    damage_description TEXT,
    damage_photos TEXT,
    
    -- Inspector info
    inspected_by VARCHAR(100),
    inspection_notes TEXT,
    
    -- Timestamps
    inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_inspection_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) ON DELETE RESTRICT,
    INDEX idx_inspection_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices table - final cost breakdown
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL UNIQUE,
    inspection_id BIGINT,
    
    -- Fee breakdown
    rental_fee DECIMAL(12,2) NOT NULL,
    overtime_hours INT DEFAULT 0,
    overtime_fee DECIMAL(10,2) DEFAULT 0.00,
    damage_fee DECIMAL(10,2) DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Total
    subtotal DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    
    -- Payment info
    payment_status ENUM('PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED') DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    paid_at TIMESTAMP NULL,
    
    -- Dates
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
