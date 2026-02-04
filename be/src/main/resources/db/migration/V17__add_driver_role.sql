-- Add ROLE_DRIVER
INSERT INTO roles (role_name, description) 
VALUES ('ROLE_DRIVER', 'Chauffeur/Driver for vehicle rentals')
ON DUPLICATE KEY UPDATE description = description;
