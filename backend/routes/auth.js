// routes/auth.js – Admin login / me
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/* POST /api/auth/login
   Body: { email, password }
   Returns: { token, admin: { id, name, email, region } }
*/
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await db.query(
      'SELECT * FROM admins WHERE email = ? AND is_active = 1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = { id: admin.id, name: admin.name, email: admin.email, region: admin.region };
    const token   = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

    res.json({ token, admin: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* GET /api/auth/me – verify token and return current admin */
router.get('/me', requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

/* POST /api/auth/change-password */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Invalid request. New password must be at least 8 characters.' });
    }

    const [rows] = await db.query('SELECT password FROM admins WHERE id = ?', [req.admin.id]);
    if (!rows.length) return res.status(404).json({ error: 'Admin not found' });

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE admins SET password = ? WHERE id = ?', [hash, req.admin.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
