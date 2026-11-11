// setup_db.js – Automated database setup and migration for MTVS
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initDb() {
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  let conn;

  if (dbUrl) {
    console.log('Connecting to MySQL via DATABASE_URL / MYSQL_URL...');
    conn = await mysql.createConnection({
      uri: dbUrl,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    });
  } else {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = parseInt(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'mtvs';

    console.log(`Connecting to MySQL on ${host}:${port} as user '${user}'...`);
    conn = await mysql.createConnection({ host, port, user, password });

    console.log('Connected! Ensuring database exists...');
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${database}\``);
  }

  console.log('Creating tables...');

  // Admins table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(150) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      region      VARCHAR(100) DEFAULT NULL,
      is_active   TINYINT(1) NOT NULL DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Requests table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      ref             VARCHAR(20)  NOT NULL UNIQUE,
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
      photo_url       VARCHAR(500) DEFAULT NULL,
      photo_public_id VARCHAR(200) DEFAULT NULL,
      shop_photo_url  VARCHAR(500) DEFAULT NULL,
      doc_photo_url   VARCHAR(500) DEFAULT NULL,
      status          ENUM('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
      reason_key      VARCHAR(40) DEFAULT NULL,
      member_id       VARCHAR(30) DEFAULT NULL,
      receipt_no      VARCHAR(30) DEFAULT NULL,
      txn_ref         VARCHAR(30) DEFAULT NULL,
      decided_at      DATETIME DEFAULT NULL,
      paid_at         DATETIME DEFAULT NULL,
      submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      decided_by      INT UNSIGNED DEFAULT NULL,
      FOREIGN KEY (decided_by) REFERENCES admins(id) ON DELETE SET NULL,
      INDEX idx_status   (status),
      INDEX idx_area     (area),
      INDEX idx_phone    (phone),
      INDEX idx_member   (member_id),
      INDEX idx_ref      (ref)
    ) ENGINE=InnoDB;
  `);

  // Ensure shop_photo_url and doc_photo_url exist
  const [cols] = await conn.query('SHOW COLUMNS FROM requests');
  const colNames = cols.map(c => c.Field);
  if (!colNames.includes('shop_photo_url')) {
    await conn.query('ALTER TABLE requests ADD COLUMN shop_photo_url VARCHAR(500) DEFAULT NULL');
  }
  if (!colNames.includes('doc_photo_url')) {
    await conn.query('ALTER TABLE requests ADD COLUMN doc_photo_url VARCHAR(500) DEFAULT NULL');
  }

  // Seed default Super Admin (admin@mtvs.in / Admin@1234)
  await conn.query(`
    INSERT IGNORE INTO admins (name, email, password, region) VALUES
    ('Super Admin', 'admin@mtvs.in', '$2b$10$YqgNn/Ii5F0VFxKvI6uLPOGpEQ1X/BtNxPVGX1z.pNbLUzH3OYQNS', NULL)
  `);

  // Regions table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS regions (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(100) NOT NULL UNIQUE,
      name_mr     VARCHAR(100) DEFAULT NULL,
      approver    VARCHAR(100) NOT NULL,
      phone       VARCHAR(20) NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Areas table
  await conn.query(`
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
  `);

  // Seed regions
  await conn.query(`
    INSERT INTO regions (id, name, name_mr, approver, phone) VALUES
      (1, 'Central Mumbai', 'मध्य मुंबई', 'Prakash Sadvilkar', '982277272'),
      (2, 'Western Suburbs', 'पश्चिम उपनगरे', 'Vinod Salvi', '9000000002'),
      (3, 'Eastern Suburbs', 'पूर्व उपनगरे', 'Mahesh Ghadge', '9000000003'),
      (4, 'Thane', 'ठाणे', 'Sandip Naik', '9000000004')
    ON DUPLICATE KEY UPDATE name=VALUES(name);
  `);

  // Seed areas
  await conn.query(`
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
  `);

  // Advertisements table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS advertisements (
      id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title           VARCHAR(200) NOT NULL,
      description     TEXT,
      description_mr  TEXT,
      phone           VARCHAR(20),
      image_url       VARCHAR(500),
      redirect_url    VARCHAR(500) DEFAULT NULL,
      start_date      DATE NOT NULL,
      end_date        DATE NOT NULL,
      is_active       TINYINT(1) NOT NULL DEFAULT 1,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Ensure redirect_url column exists
  const [adCols] = await conn.query('SHOW COLUMNS FROM advertisements');
  if (!adCols.map(c => c.Field).includes('redirect_url')) {
    await conn.query('ALTER TABLE advertisements ADD COLUMN redirect_url VARCHAR(500) DEFAULT NULL');
  }

  // Seed sample advertisements if empty
  const [adCount] = await conn.query('SELECT COUNT(*) as count FROM advertisements');
  if (adCount[0].count === 0) {
    await conn.query(`
      INSERT INTO advertisements (title, description, description_mr, phone, image_url, start_date, end_date, is_active) VALUES
      ('Patil Bidi Works', 'Authorized distributor for Western Mumbai. Premium hand-rolled bidis & betel leaves.', 'पश्चिम मुंबईचे अधिकृत वितरक. दर्जेदार विडी व खाऊची पाने.', '9820011223', '', '2026-01-01', '2027-12-31', 1),
      ('Shree Ganesh Tambakhu Mart', 'Wholesale supplier of certified chewing tobacco, pan masala and accessories. Dadar Market.', 'दादर मार्केट मधील प्रमाणित तंबाखू व मसाला घाऊक विक्रेते.', '9821033445', '', '2026-01-01', '2027-12-31', 1),
      ('Maharashtra Bidi Kamgar Sahakari', 'Welfare society for licensed bidi rollers & union retailers. Subsidized supplies & support.', 'परवानाधारक विडी कामगार व विक्रेत्यांची सहकारी संस्था.', '9822055667', '', '2026-01-01', '2027-12-31', 1),
      ('Jai Bharat Pan Agency', 'Specialist in export quality betel nuts, lime, kattha & silver foils.', 'उत्कृष्ट दर्जाचे कात, चुना, सुपारी व चांदीचा वर्क.', '9819077889', '', '2026-01-01', '2027-12-31', 1);
    `);
  }

  console.log('✅ All MTVS tables, seed data, and schema enhancements applied successfully!');
  await conn.end();
}

initDb().catch(e => {
  console.error('❌ Database setup failed:', e.message);
  process.exit(1);
});
