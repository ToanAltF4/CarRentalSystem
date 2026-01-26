-- Fix vehicle prices (Convert USD to VND)
-- Assuming current values are ~50-100 USD, we multiply by 25,000 to get VND

-- Update Vehicles
UPDATE vehicles 
SET daily_rate = daily_rate * 25000;

-- Update Pricing (Categories)
UPDATE pricing 
SET daily_price = daily_price * 25000,
    weekly_price = weekly_price * 25000,
    monthly_price = monthly_price * 25000,
    overtime_fee_per_hour = overtime_fee_per_hour * 25000;

-- Update Driver/Delivery Pricing
UPDATE driver_pricing SET daily_fee = daily_fee * 25000;
UPDATE delivery_pricing SET base_fee = base_fee * 25000;

-- Update Bookings (Historical data)
UPDATE bookings 
SET daily_rate = daily_rate * 25000,
    rental_fee = rental_fee * 25000,
    driver_fee = driver_fee * 25000,
    delivery_fee = delivery_fee * 25000,
    total_amount = total_amount * 25000;

-- Update Invoices
UPDATE invoices
SET rental_fee = rental_fee * 25000,
    driver_fee = driver_fee * 25000,
    delivery_fee = delivery_fee * 25000,
    damage_fee = damage_fee * 25000,
    total_amount = total_amount * 25000;

-- Update Payments
UPDATE payments
SET amount = amount * 25000;
