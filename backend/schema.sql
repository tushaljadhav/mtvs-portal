-- ================================================================
--  MTVS Database Schema
-- ================================================================

CREATE DATABASE IF NOT EXISTS mtvs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mtvs;

-- ── Admins ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hash
  region      VARCHAR(100) DEFAULT NULL,  -- NULL = super admin, else region name
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Requests (pending → approved → paid | rejected) ──────────────
CREATE TABLE IF NOT EXISTS requests (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ref             VARCHAR(20)  NOT NULL UNIQUE,          -- e.g. REQ-2026-00001
  name            VARCHAR(100) NOT NULL,
  age             TINYINT UNSIGNED NOT NULL,
  gender          ENUM('Male','Female','Other') NOT NULL,
  phone           VARCHAR(15) NOT NULL,
  email           VARCHAR(150) DEFAULT NULL,
  id_type         VARCHAR(50) NOT NULL,
  id_number       VARCHAR(60) DEFAULT NULL,
  shop            VARCHAR(150) NOT NULL,
  work_type       VARCHAR(60) NOT NULL,
  address         TEXT NOT NULL,
  area            VARCHAR(80) NOT NULL,
  pincode         VARCHAR(10) NOT NULL,
  lat             DECIMAL(9,6) DEFAULT NULL,
  lng             DECIMAL(9,6) DEFAULT NULL,
  photo_url       VARCHAR(500) DEFAULT NULL,             -- Cloudinary URL
  photo_public_id VARCHAR(200) DEFAULT NULL,             -- for deletion
  status          ENUM('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
  reason_key      VARCHAR(40) DEFAULT NULL,              -- rejection reason
  member_id       VARCHAR(30) DEFAULT NULL,              -- MTVS-2026-XXXXX
  receipt_no      VARCHAR(30) DEFAULT NULL,
  txn_ref         VARCHAR(30) DEFAULT NULL,
  decided_at      DATETIME DEFAULT NULL,
  paid_at         DATETIME DEFAULT NULL,
  submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  decided_by      INT UNSIGNED DEFAULT NULL,             -- admin.id
  FOREIGN KEY (decided_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_status   (status),
  INDEX idx_area     (area),
  INDEX idx_phone    (phone),
  INDEX idx_member   (member_id),
  INDEX idx_ref      (ref)
) ENGINE=InnoDB;

-- ── Seed: super admin (password: Admin@1234) ─────────────────────
-- Run this only once; then change password via admin panel
INSERT IGNORE INTO admins (name, email, password, region) VALUES
  ('Super Admin', 'admin@mtvs.in', '$2b$10$YqgNn/Ii5F0VFxKvI6uLPOGpEQ1X/BtNxPVGX1z.pNbLUzH3OYQNS', NULL);
-- ^ hash of 'Admin@1234'; generate a fresh one with node: require('bcryptjs').hash('YourPass',10)
