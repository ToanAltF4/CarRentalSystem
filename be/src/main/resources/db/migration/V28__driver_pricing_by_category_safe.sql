-- Normalize driver pricing to support per-vehicle-category fees.
-- This migration is defensive so it can run on older schemas.

-- 1) Ensure driver_pricing has vehicle_category_id column.
SET @has_driver_category_col := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'driver_pricing'
      AND COLUMN_NAME = 'vehicle_category_id'
);
SET @sql_add_col := IF(
    @has_driver_category_col = 0,
    'ALTER TABLE driver_pricing ADD COLUMN vehicle_category_id BIGINT NULL AFTER id',
    'SELECT 1'
);
PREPARE stmt_add_col FROM @sql_add_col;
EXECUTE stmt_add_col;
DEALLOCATE PREPARE stmt_add_col;

-- 2) Ensure index exists for category/effective range lookup.
SET @has_driver_category_idx := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'driver_pricing'
      AND INDEX_NAME = 'idx_driver_pricing_category_effective'
);
SET @sql_add_idx := IF(
    @has_driver_category_idx = 0,
    'ALTER TABLE driver_pricing ADD INDEX idx_driver_pricing_category_effective (vehicle_category_id, effective_from, effective_to, is_active)',
    'SELECT 1'
);
PREPARE stmt_add_idx FROM @sql_add_idx;
EXECUTE stmt_add_idx;
DEALLOCATE PREPARE stmt_add_idx;

-- 3) Ensure foreign key exists.
SET @has_driver_category_fk := (
    SELECT COUNT(*)
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'driver_pricing'
      AND CONSTRAINT_NAME = 'fk_driver_pricing_vehicle_category'
);
SET @sql_add_fk := IF(
    @has_driver_category_fk = 0,
    'ALTER TABLE driver_pricing ADD CONSTRAINT fk_driver_pricing_vehicle_category FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id)',
    'SELECT 1'
);
PREPARE stmt_add_fk FROM @sql_add_fk;
EXECUTE stmt_add_fk;
DEALLOCATE PREPARE stmt_add_fk;

-- 4) Insert active driver pricing per category if missing.
-- Pricing rule:
-- daily driver fee ~= 20% of current category daily price
-- clamped to [350,000, 1,200,000] VND and rounded to nearest 10,000.
INSERT INTO driver_pricing (
    vehicle_category_id,
    daily_fee,
    effective_from,
    effective_to,
    is_active
)
SELECT
    vc.id,
    LEAST(
        GREATEST(
            ROUND(
                COALESCE(
                    (
                        SELECT p.daily_price
                        FROM pricing p
                        WHERE p.vehicle_category_id = vc.id
                          AND p.is_active = 1
                          AND p.effective_from <= CURRENT_DATE
                          AND (p.effective_to IS NULL OR p.effective_to >= CURRENT_DATE)
                        ORDER BY p.effective_from DESC
                        LIMIT 1
                    ),
                    2500000
                ) * 0.20,
                -4
            ),
            350000
        ),
        1200000
    ) AS daily_fee,
    CURRENT_DATE,
    NULL,
    1
FROM vehicle_categories vc
WHERE NOT EXISTS (
    SELECT 1
    FROM driver_pricing dp
    WHERE dp.vehicle_category_id = vc.id
      AND dp.is_active = 1
      AND dp.effective_from <= CURRENT_DATE
      AND (dp.effective_to IS NULL OR dp.effective_to >= CURRENT_DATE)
);

-- 5) Keep one generic fallback row (vehicle_category_id = NULL).
INSERT INTO driver_pricing (
    vehicle_category_id,
    daily_fee,
    effective_from,
    effective_to,
    is_active
)
SELECT
    NULL,
    500000,
    CURRENT_DATE,
    NULL,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM driver_pricing dp
    WHERE dp.vehicle_category_id IS NULL
      AND dp.is_active = 1
      AND dp.effective_from <= CURRENT_DATE
      AND (dp.effective_to IS NULL OR dp.effective_to >= CURRENT_DATE)
);
