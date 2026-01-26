-- Add image_url column to vehicles table
ALTER TABLE vehicles ADD COLUMN image_url VARCHAR(500);

-- Backfill existing vehicles with placeholder images
UPDATE vehicles SET image_url = 'https://placehold.co/600x400?text=Car+Image' WHERE image_url IS NULL;
