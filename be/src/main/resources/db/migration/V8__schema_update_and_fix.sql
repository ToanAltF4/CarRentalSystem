ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS battery_capacity_kwh DECIMAL(5,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS range_km INT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS charging_time_hours DECIMAL(4,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seats INT DEFAULT 5;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description TEXT;

-- Reset passwords to match 'password123' (BCrypt hash)
UPDATE users SET password = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRkgVdukPxk.y.TqFm./z.s.a/6' WHERE email IN ('minhpn@gmail.com', 'admin@carrentalsystem.com', 'staff@carrentalsystem.com');

-- Re-apply image urls
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800' WHERE brand = 'Tesla';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800' WHERE brand = 'VinFast';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800' WHERE brand = 'BMW';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800' WHERE brand = 'Mercedes';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800' WHERE brand = 'Porsche';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800' WHERE brand = 'Hyundai' OR brand = 'Kia';
UPDATE vehicles SET image_url = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800' WHERE image_url IS NULL;

-- Default data for new columns
UPDATE vehicles SET seats = 5 WHERE seats IS NULL;
UPDATE vehicles SET range_km = 400 WHERE range_km IS NULL;
UPDATE vehicles SET battery_capacity_kwh = 75.0 WHERE battery_capacity_kwh IS NULL;
UPDATE vehicles SET charging_time_hours = 8.0 WHERE charging_time_hours IS NULL;
