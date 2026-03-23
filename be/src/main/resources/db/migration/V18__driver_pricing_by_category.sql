-- =====================================================
-- MIGRATION V18: Driver Pricing by Vehicle Category
-- Adds vehicle_category_id to driver_pricing table
-- Adds per_km_fee to delivery_pricing table
-- =====================================================

-- STEP 1: Add vehicle_category_id column to driver_pricing
ALTER TABLE driver_pricing 
ADD COLUMN vehicle_category_id BIGINT NULL AFTER id;

-- STEP 2: Add foreign key constraint
ALTER TABLE driver_pricing 
ADD CONSTRAINT fk_driver_pricing_category 
FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id);

-- STEP 3: Add per_km_fee to delivery_pricing
ALTER TABLE delivery_pricing 
ADD COLUMN per_km_fee DECIMAL(10,2) DEFAULT 10000.00 AFTER base_fee;

-- STEP 4: Clear old driver_pricing data and insert new by category
DELETE FROM driver_pricing;

-- STEP 5: Insert driver pricing for each vehicle category
-- Pricing based on Vietnamese market rates (VND/day)
-- Sedan/Compact: 500,000
-- SUV/Crossover: 600,000
-- Luxury/Premium: 800,000
-- Van/Minivan: 700,000
-- Default: 600,000
INSERT INTO driver_pricing (vehicle_category_id, daily_fee, effective_from, effective_to, is_active)
SELECT 
    vc.id,
    CASE 
        WHEN LOWER(vc.name) LIKE '%sedan%' OR LOWER(vc.name) LIKE '%compact%' OR LOWER(vc.name) LIKE '%hatchback%' THEN 500000.00
        WHEN LOWER(vc.name) LIKE '%suv%' OR LOWER(vc.name) LIKE '%crossover%' THEN 600000.00
        WHEN LOWER(vc.name) LIKE '%luxury%' OR LOWER(vc.name) LIKE '%premium%' THEN 800000.00
        WHEN LOWER(vc.name) LIKE '%van%' OR LOWER(vc.name) LIKE '%minivan%' THEN 700000.00
        ELSE 600000.00
    END as daily_fee,
    '2024-01-01' as effective_from,
    NULL as effective_to,
    1 as is_active
FROM vehicle_categories vc;

-- STEP 6: Update delivery_pricing with proper Vietnamese pricing
-- Base fee: 50,000 VND
-- Per km fee: 10,000 VND/km
DELETE FROM delivery_pricing;
INSERT INTO delivery_pricing (base_fee, per_km_fee, effective_from, effective_to, is_active)
VALUES (50000.00, 10000.00, '2024-01-01', NULL, 1);
