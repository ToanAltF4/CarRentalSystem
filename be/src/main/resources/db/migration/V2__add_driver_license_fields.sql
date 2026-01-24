ALTER TABLE users
    ADD COLUMN license_status VARCHAR(20) NOT NULL DEFAULT 'NONE' AFTER license_number,
    ADD COLUMN license_type VARCHAR(50) NULL AFTER license_status,
    ADD COLUMN license_front_image_url VARCHAR(500) NULL AFTER license_type,
    ADD COLUMN date_of_birth DATE NULL AFTER license_front_image_url;
