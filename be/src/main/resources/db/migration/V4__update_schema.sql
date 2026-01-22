-- Add new columns to Vehicles Table (seats, description)
-- category_id already exists from V2
ALTER TABLE vehicles ADD COLUMN seats INT DEFAULT 5;
ALTER TABLE vehicles ADD COLUMN description TEXT;

-- Insert Additional Categories (Sedan, SUV) if they don't exist
-- We use INSERT IGNORE based on unique name constraint
INSERT IGNORE INTO vehicle_categories (name, description) VALUES 
('Sedan', 'Standard 4-door car'),
('SUV', 'Sports Utility Vehicle');

-- Note: 'Luxury' likely exists (case insensitive check? V2 inserts 'LUXURY')
-- If we want strict 'Luxury', and 'LUXURY' exists, unique constraint might default to case insensitive collation.
-- If so, INSERT IGNORE skips it.
INSERT IGNORE INTO vehicle_categories (name, description) VALUES 
('Luxury', 'Premium styling and features');
