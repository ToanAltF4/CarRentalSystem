-- Ensure each vehicle category has at least 3 physical vehicles.
-- Idempotent: only inserts missing rows and avoids duplicate license_plate/vin.

INSERT INTO vehicles (
  vehicle_category_id,
  license_plate,
  status,
  vin,
  odometer,
  current_battery_percent
)
SELECT
  seed.category_id,
  seed.license_plate,
  'AVAILABLE',
  seed.vin,
  seed.odometer,
  seed.current_battery_percent
FROM (
  SELECT
    vc.id AS category_id,
    CONCAT('99A-', LPAD((vc.id * 1000) + COALESCE(cnt.current_count, 0) + n.seq, 5, '0')) AS license_plate,
    CONCAT('VINSEED', LPAD(vc.id, 3, '0'), LPAD(COALESCE(cnt.current_count, 0) + n.seq, 6, '0')) AS vin,
    1000 + ((COALESCE(cnt.current_count, 0) + n.seq) * 120) AS odometer,
    85 AS current_battery_percent
  FROM vehicle_categories vc
  LEFT JOIN (
    SELECT
      vehicle_category_id,
      COUNT(*) AS current_count
    FROM vehicles
    GROUP BY vehicle_category_id
  ) cnt
    ON cnt.vehicle_category_id = vc.id
  JOIN (
    SELECT 1 AS seq
    UNION ALL SELECT 2
    UNION ALL SELECT 3
  ) n
    ON n.seq <= GREATEST(0, 3 - COALESCE(cnt.current_count, 0))
) seed
LEFT JOIN vehicles existing_plate
  ON existing_plate.license_plate = seed.license_plate
LEFT JOIN vehicles existing_vin
  ON existing_vin.vin = seed.vin
WHERE existing_plate.id IS NULL
  AND existing_vin.id IS NULL;
