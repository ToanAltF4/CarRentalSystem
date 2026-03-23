-- Normalize vehicle status values to operational-only statuses.
-- Rental occupancy is handled by bookings/selected dates.

UPDATE vehicles
SET status = 'INACTIVE'
WHERE UPPER(status) = 'RENTED';

UPDATE vehicles
SET status = UPPER(status)
WHERE status IS NOT NULL;

UPDATE vehicles
SET status = 'INACTIVE'
WHERE status NOT IN ('AVAILABLE', 'MAINTENANCE', 'INACTIVE');
