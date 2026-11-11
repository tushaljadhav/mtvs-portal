// db.js – MySQL2 connection pool (Cloud & Local compatible)
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

let poolConfig;
if (dbUrl) {
  poolConfig = {
    uri:                dbUrl,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           '+05:30',
    charset:            'utf8mb4',
    ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
  };
} else {
  poolConfig = {
    host:               process.env.DB_HOST     || 'localhost',
    port:               parseInt(process.env.DB_PORT) || 3306,
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'mtvs',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           '+05:30',
    charset:            'utf8mb4',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

const pool = mysql.createPool(poolConfig);

// Verify connection on startup
pool.getConnection()
  .then(conn => { console.log('✅ MySQL connected'); conn.release(); })
  .catch(err => { console.error('❌ MySQL connection failed:', err.message); process.exit(1); });

module.exports = pool;
