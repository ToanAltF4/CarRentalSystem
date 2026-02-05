-- Update driver_pricing với mức phí phù hợp Việt Nam
-- Phí tài xế: 600,000 VND/ngày cho dòng active

UPDATE driver_pricing SET daily_fee = 600000.00, is_active = 1 WHERE id = 1;
UPDATE driver_pricing SET daily_fee = 700000.00, is_active = 0 WHERE id = 2;

-- Kiểm tra bảng delivery_pricing và cập nhật nếu cần
-- Phí giao xe cơ bản: 50,000 VND

INSERT INTO delivery_pricing (base_fee, effective_from, effective_to, is_active) 
SELECT 50000.00, '2024-01-01', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM delivery_pricing WHERE is_active = 1);

-- Hoặc update nếu đã có
UPDATE delivery_pricing SET base_fee = 50000.00 WHERE is_active = 1;

-- Xem kết quả
SELECT 'driver_pricing' as table_name, id, daily_fee, effective_from, is_active FROM driver_pricing
UNION ALL
SELECT 'delivery_pricing' as table_name, id, base_fee, effective_from, is_active FROM delivery_pricing;
