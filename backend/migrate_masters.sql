USE mtvs;

-- ── Regions Table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS regions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  name_mr     VARCHAR(100) DEFAULT NULL,
  approver    VARCHAR(100) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Areas Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS areas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  region_id   INT UNSIGNED NOT NULL,
  name        VARCHAR(100) NOT NULL UNIQUE,
  lat         DECIMAL(9,6) DEFAULT NULL,
  lng         DECIMAL(9,6) DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
  INDEX idx_region (region_id)
) ENGINE=InnoDB;

-- ── Seed Initial Regions ─────────────────────────────────────────
INSERT INTO regions (id, name, name_mr, approver, phone) VALUES
  (1, 'Central Mumbai', 'मध्य मुंबई', 'Prakash Sadvilkar', '982277272'),
  (2, 'Western Suburbs', 'पश्चिम उपनगरे', 'Vinod Salvi', '9000000002'),
  (3, 'Eastern Suburbs', 'पूर्व उपनगरे', 'Mahesh Ghadge', '9000000003'),
  (4, 'Thane', 'ठाणे', 'Sandip Naik', '9000000004')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ── Seed Initial Areas ───────────────────────────────────────────
INSERT INTO areas (region_id, name, lat, lng) VALUES
  (1, 'Dharavi', 19.042500, 72.852000),
  (1, 'Dadar', 19.018500, 72.842800),
  (1, 'Worli', 18.994600, 72.823200),
  (2, 'Bandra', 19.054400, 72.840200),
  (2, 'Andheri East', 19.113600, 72.869700),
  (2, 'Andheri West', 19.119700, 72.846800),
  (2, 'Malad', 19.180000, 72.848800),
  (2, 'Borivali', 19.230700, 72.856700),
  (3, 'Kurla', 19.071800, 72.888400),
  (3, 'Chembur', 19.052200, 72.900500),
  (3, 'Ghatkopar', 19.087000, 72.909600),
  (4, 'Thane', 19.214800, 72.978600)
ON DUPLICATE KEY UPDATE region_id=VALUES(region_id), lat=VALUES(lat), lng=VALUES(lng);
