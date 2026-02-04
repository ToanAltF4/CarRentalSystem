-- Migration V15: Add OPERATOR role and booking assignment fields

-- 1. Add OPERATOR role to roles table
INSERT INTO roles (name, description) 
SELECT 'OPERATOR', 'Operations staff for booking management and license verification'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'OPERATOR');

-- 2. Add assignment columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_staff_id BIGINT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_by BIGINT NULL;

-- 3. Add foreign key constraints (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_booking_assigned_staff' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_booking_assigned_staff 
            FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_booking_assigned_by' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_booking_assigned_by 
            FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_booking_assigned_staff ON bookings(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_booking_assigned_at ON bookings(assigned_at);
