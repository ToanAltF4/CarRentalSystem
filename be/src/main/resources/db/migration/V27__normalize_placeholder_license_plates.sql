-- Replace placeholder license plates (AUTO-/SEED-) with stable display-friendly plates.
-- Keep uniqueness by deriving from vehicle id.

UPDATE vehicles
SET license_plate = CONCAT('99A-', LPAD(id, 5, '0'))
WHERE license_plate LIKE 'AUTO-%'
   OR license_plate LIKE 'SEED-%';
