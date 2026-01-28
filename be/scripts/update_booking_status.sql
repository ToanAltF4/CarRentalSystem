-- ============================================
-- Script: Update Booking Status for New Flow
-- Description: Update all PENDING bookings to CONFIRMED
-- since the new logic auto-confirms bookings
-- when user has approved driver's license
-- ============================================

-- 1. Check current PENDING bookings (preview)
SELECT 
    id, 
    booking_code, 
    customer_name, 
    customer_email,
    status, 
    start_date, 
    end_date,
    total_amount
FROM bookings 
WHERE status = 'PENDING';

-- 2. Update all PENDING bookings to CONFIRMED
UPDATE bookings 
SET status = 'CONFIRMED', 
    updated_at = NOW()
WHERE status = 'PENDING';

-- 3. Verify update (should show 0 PENDING)
SELECT 
    status, 
    COUNT(*) as count 
FROM bookings 
GROUP BY status;

-- ============================================
-- Additional: Update user license status for testing
-- (Optional - run if you want to test the new flow)
-- ============================================

-- Set a specific user's license to APPROVED (replace ID)
-- UPDATE users SET license_status = 'APPROVED' WHERE id = 3;

-- Set all users with uploaded license to APPROVED
-- UPDATE users SET license_status = 'APPROVED' 
-- WHERE license_number IS NOT NULL AND license_front_image_url IS NOT NULL;
