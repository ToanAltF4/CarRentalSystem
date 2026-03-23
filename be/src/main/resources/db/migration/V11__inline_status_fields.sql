-- Inline status/type fields into business tables and drop lookup tables

-- Add new columns
ALTER TABLE handover_records
    ADD COLUMN exterior_condition VARCHAR(30) NULL,
    ADD COLUMN interior_condition VARCHAR(30) NULL;

ALTER TABLE inspections
    ADD COLUMN exterior_condition VARCHAR(30) NULL,
    ADD COLUMN interior_condition VARCHAR(30) NULL;

ALTER TABLE invoices
    ADD COLUMN payment_status VARCHAR(30) NULL;

ALTER TABLE payments
    ADD COLUMN payment_status VARCHAR(30) NULL;

-- Backfill from lookup tables
UPDATE handover_records hr
LEFT JOIN condition_types c1 ON hr.exterior_condition_id = c1.id
LEFT JOIN condition_types c2 ON hr.interior_condition_id = c2.id
SET hr.exterior_condition = c1.code,
    hr.interior_condition = c2.code;

UPDATE inspections i
LEFT JOIN condition_types c1 ON i.exterior_condition_id = c1.id
LEFT JOIN condition_types c2 ON i.interior_condition_id = c2.id
SET i.exterior_condition = c1.code,
    i.interior_condition = c2.code;

UPDATE invoices i
LEFT JOIN invoice_payment_statuses s ON i.payment_status_id = s.id
SET i.payment_status = s.code;

UPDATE payments p
LEFT JOIN payment_statuses s ON p.payment_status_id = s.id
SET p.payment_status = s.code;

-- Drop foreign keys to lookup tables (dynamic, in case names differ)
SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'handover_records'
      AND COLUMN_NAME = 'exterior_condition_id'
      AND REFERENCED_TABLE_NAME = 'condition_types'
    LIMIT 1
);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE handover_records DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'handover_records'
      AND COLUMN_NAME = 'interior_condition_id'
      AND REFERENCED_TABLE_NAME = 'condition_types'
    LIMIT 1
);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE handover_records DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'inspections'
      AND COLUMN_NAME = 'exterior_condition_id'
      AND REFERENCED_TABLE_NAME = 'condition_types'
    LIMIT 1
);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE inspections DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'inspections'
      AND COLUMN_NAME = 'interior_condition_id'
      AND REFERENCED_TABLE_NAME = 'condition_types'
    LIMIT 1
);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE inspections DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'invoices'
      AND COLUMN_NAME = 'payment_status_id'
      AND REFERENCED_TABLE_NAME = 'invoice_payment_statuses'
    LIMIT 1
);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE invoices DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'payments'
      AND COLUMN_NAME = 'payment_status_id'
      AND REFERENCED_TABLE_NAME = 'payment_statuses'
    LIMIT 1
);
SET @sql := IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE payments DROP FOREIGN KEY ', @fk));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Drop old columns
ALTER TABLE handover_records
    DROP COLUMN exterior_condition_id,
    DROP COLUMN interior_condition_id;

ALTER TABLE inspections
    DROP COLUMN exterior_condition_id,
    DROP COLUMN interior_condition_id;

ALTER TABLE invoices
    DROP COLUMN payment_status_id;

ALTER TABLE payments
    DROP COLUMN payment_status_id;

-- Add index for invoice payment status
CREATE INDEX idx_invoice_payment_status ON invoices(payment_status);

-- Drop lookup tables
DROP TABLE IF EXISTS invoice_payment_statuses;
DROP TABLE IF EXISTS payment_statuses;
DROP TABLE IF EXISTS condition_types;
