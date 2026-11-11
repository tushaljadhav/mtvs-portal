const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await conn.query('SELECT * FROM admins');
    console.log('Admins found:', rows.map(r => ({ id: r.id, email: r.email })));

    const match = rows.length ? await bcrypt.compare('Admin@1234', rows[0].password) : false;
    console.log('Matches Admin@1234:', match);

    const hash = await bcrypt.hash('Admin@1234', 10);
    if (!rows.length) {
      await conn.query('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)', ['Super Admin', 'admin@mtvs.in', hash]);
      console.log('Created Super Admin with Admin@1234');
    } else {
      await conn.query('UPDATE admins SET password = ? WHERE id = ?', [hash, rows[0].id]);
      console.log('Updated Super Admin password to Admin@1234');
    }

    await conn.end();
  } catch (err) {
    console.error('Error:', err);
  }
})();

