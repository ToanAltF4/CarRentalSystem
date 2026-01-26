CREATE TABLE payment_methods (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE rental_types (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE pickup_methods (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(50)
);

CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE vehicle_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  vehicle_category_id BIGINT,
  daily_price DECIMAL(10,2),
  weekly_price DECIMAL(10,2),
  monthly_price DECIMAL(10,2),
  overtime_fee_per_hour DECIMAL(8,2),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN,
  FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id)
);

CREATE TABLE vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  model VARCHAR(100),
  brand VARCHAR(50),
  license_plate VARCHAR(20) UNIQUE,
  daily_rate DECIMAL(10,2),
  status VARCHAR(30),
  category_id BIGINT,
  image_url VARCHAR(500),
  battery_capacity_kwh DECIMAL(5,2),
  range_km INT,
  charging_time_hours DECIMAL(4,2),
  seats INT,
  description TEXT,
  FOREIGN KEY (category_id) REFERENCES vehicle_categories(id)
);

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role_id BIGINT,
  license_type VARCHAR(50),
  license_number VARCHAR(50),
  date_of_birth DATE,
  license_front_image_url VARCHAR(500),
  license_status VARCHAR(30),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE,
  token VARCHAR(500),
  expiry_date TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE drivers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  status VARCHAR(30)
);

CREATE TABLE driver_pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  daily_fee DECIMAL(10,2),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN
);

CREATE TABLE delivery_pricing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  base_fee DECIMAL(10,2),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN
);

CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE,
  vehicle_id BIGINT,
  user_id BIGINT,
  rental_type_id TINYINT,
  pickup_method_id TINYINT,
  driver_id BIGINT,
  customer_name VARCHAR(100),
  customer_email VARCHAR(100),
  start_date DATE,
  end_date DATE,
  daily_rate DECIMAL(10,2),
  rental_fee DECIMAL(12,2),
  driver_fee DECIMAL(12,2),
  delivery_fee DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  status VARCHAR(30),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (rental_type_id) REFERENCES rental_types(id),
  FOREIGN KEY (pickup_method_id) REFERENCES pickup_methods(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

CREATE TABLE handover_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNIQUE,
  battery_level INT,
  odometer INT,
  exterior_condition VARCHAR(30),
  interior_condition VARCHAR(30),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE inspections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNIQUE,
  battery_level INT,
  odometer INT,
  exterior_condition VARCHAR(30),
  interior_condition VARCHAR(30),
  has_damage BOOLEAN,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(30) UNIQUE,
  booking_id BIGINT UNIQUE,
  rental_fee DECIMAL(12,2),
  driver_fee DECIMAL(12,2),
  delivery_fee DECIMAL(12,2),
  damage_fee DECIMAL(10,2),
  total_amount DECIMAL(12,2),
  payment_status VARCHAR(30),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE INDEX idx_invoice_payment_status ON invoices(payment_status);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT,
  amount DECIMAL(12,2),
  payment_method_id TINYINT,
  payment_status VARCHAR(30),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

CREATE TABLE vehicle_locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id BIGINT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
