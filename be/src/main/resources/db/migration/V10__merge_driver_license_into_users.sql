-- Merge driver_licenses data into users table
ALTER TABLE users
    ADD COLUMN license_type VARCHAR(50) NULL,
    ADD COLUMN license_number VARCHAR(50) NULL,
    ADD COLUMN date_of_birth DATE NULL,
    ADD COLUMN license_front_image_url VARCHAR(500) NULL,
    ADD COLUMN license_status_id TINYINT NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_users_license_status
    FOREIGN KEY (license_status_id) REFERENCES license_statuses(id);

UPDATE users u
JOIN driver_licenses d ON d.user_id = u.id
SET u.license_type = d.license_type,
    u.license_number = d.license_number,
    u.date_of_birth = d.date_of_birth,
    u.license_front_image_url = d.front_image_url,
    u.license_status_id = d.status_id;

DROP TABLE IF EXISTS driver_licenses;
