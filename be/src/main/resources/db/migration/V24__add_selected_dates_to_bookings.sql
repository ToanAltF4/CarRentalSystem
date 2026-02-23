-- Add selected_dates column in a MySQL-compatible, idempotent way.
SET @selected_dates_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'bookings'
      AND COLUMN_NAME = 'selected_dates'
);

SET @ddl := IF(
    @selected_dates_exists = 0,
    'ALTER TABLE bookings ADD COLUMN selected_dates TEXT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill selected_dates from legacy [start_date, end_date] inclusive range.
-- Number generator supports rentals up to 1000 days.
SET SESSION group_concat_max_len = 10240;

UPDATE bookings b
JOIN (
    SELECT
        src.id,
        GROUP_CONCAT(
            DATE_FORMAT(DATE_ADD(src.start_date, INTERVAL n.num DAY), '%Y-%m-%d')
            ORDER BY n.num
            SEPARATOR ','
        ) AS selected_dates_csv
    FROM bookings src
    JOIN (
        SELECT ones.n + tens.n * 10 + hundreds.n * 100 AS num
        FROM (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
              UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
        CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
                    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
        CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
                    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) hundreds
    ) n
      ON DATE_ADD(src.start_date, INTERVAL n.num DAY) <= src.end_date
    WHERE (src.selected_dates IS NULL OR TRIM(src.selected_dates) = '')
      AND src.start_date IS NOT NULL
      AND src.end_date IS NOT NULL
      AND src.start_date <= src.end_date
    GROUP BY src.id
) x ON x.id = b.id
SET b.selected_dates = x.selected_dates_csv
WHERE b.selected_dates IS NULL OR TRIM(b.selected_dates) = '';

-- Normalize legacy range columns from selected_dates so end_date is inclusive.
UPDATE bookings
SET
    start_date = STR_TO_DATE(SUBSTRING_INDEX(selected_dates, ',', 1), '%Y-%m-%d'),
    end_date = STR_TO_DATE(SUBSTRING_INDEX(selected_dates, ',', -1), '%Y-%m-%d'),
    total_days = 1 + LENGTH(selected_dates) - LENGTH(REPLACE(selected_dates, ',', ''))
WHERE selected_dates IS NOT NULL
  AND TRIM(selected_dates) <> '';
