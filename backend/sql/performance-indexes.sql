-- Apply once on production database when DB_SYNCHRONIZE=false.
-- Run this script in the target MySQL database.

SET @db = DATABASE();

-- products
SELECT COUNT(*) INTO @idx_exists FROM information_schema.statistics
WHERE table_schema = @db AND table_name = 'products' AND index_name = 'idx_products_active_category_created';
SET @sql = IF(
  @idx_exists = 0,
  'CREATE INDEX idx_products_active_category_created ON products (isActive, category, createdAt)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @idx_exists FROM information_schema.statistics
WHERE table_schema = @db AND table_name = 'products' AND index_name = 'idx_products_active_featured_created';
SET @sql = IF(
  @idx_exists = 0,
  'CREATE INDEX idx_products_active_featured_created ON products (isActive, isFeatured, createdAt)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- news
SELECT COUNT(*) INTO @idx_exists FROM information_schema.statistics
WHERE table_schema = @db AND table_name = 'news' AND index_name = 'idx_news_published_category_created';
SET @sql = IF(
  @idx_exists = 0,
  'CREATE INDEX idx_news_published_category_created ON news (isPublished, category, createdAt)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @idx_exists FROM information_schema.statistics
WHERE table_schema = @db AND table_name = 'news' AND index_name = 'idx_news_published_date_created';
SET @sql = IF(
  @idx_exists = 0,
  'CREATE INDEX idx_news_published_date_created ON news (isPublished, date, createdAt)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- certificates
SELECT COUNT(*) INTO @idx_exists FROM information_schema.statistics
WHERE table_schema = @db AND table_name = 'certificates' AND index_name = 'idx_certificates_active_type_sort';
SET @sql = IF(
  @idx_exists = 0,
  'CREATE INDEX idx_certificates_active_type_sort ON certificates (isActive, type, sortOrder)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @idx_exists FROM information_schema.statistics
WHERE table_schema = @db AND table_name = 'certificates' AND index_name = 'idx_certificates_type_created';
SET @sql = IF(
  @idx_exists = 0,
  'CREATE INDEX idx_certificates_type_created ON certificates (type, createdAt)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
