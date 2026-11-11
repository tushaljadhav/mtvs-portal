// routes/ads.js – Advertisements CRUD + Image Upload
const express = require('express');
const db      = require('../db');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../cloudinary');

const router = express.Router();

function getFileUrl(file) {
  if (!file) return null;
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  if (file.filename) {
    return `/uploads/${file.filename}`;
  }
  return null;
}

/* ── GET / – list ads ─────────────────────────────────────────── */
// Public: active ads within date range
// ?all=true (admin): return ALL ads regardless of status/dates
router.get('/', async (req, res) => {
  try {
    let sql, params = [];

    if (req.query.all === 'true') {
      sql = 'SELECT * FROM advertisements ORDER BY created_at DESC';
    } else {
      sql = `SELECT * FROM advertisements
             WHERE is_active = 1
               AND start_date <= CURDATE()
               AND end_date   >= CURDATE()
             ORDER BY created_at DESC`;
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('List ads error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ── POST / – create ad (auth required, accepts image upload) ── */
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, description_mr, phone, redirect_url, start_date, end_date, is_active } = req.body;
    let imageUrl = req.body.image_url || null;

    if (req.file) {
      imageUrl = getFileUrl(req.file);
    }

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'title, start_date and end_date are required' });
    }
    if (end_date < start_date) {
      return res.status(400).json({ error: 'end_date cannot be earlier than start_date' });
    }

    const [result] = await db.query(
      `INSERT INTO advertisements (title, description, description_mr, phone, redirect_url, image_url, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, description_mr || null, phone || null, redirect_url || null,
       imageUrl, start_date, end_date, is_active !== undefined ? Number(is_active) : 1]
    );

    const [rows] = await db.query('SELECT * FROM advertisements WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create ad error:', err);
    res.status(500).json({ error: 'Failed to create advertisement' });
  }
});

/* ── PUT /:id – update ad (auth required, accepts image upload) ── */
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, description_mr, phone, redirect_url, start_date, end_date, is_active } = req.body;
    let imageUrl = req.body.image_url;

    if (req.file) {
      imageUrl = getFileUrl(req.file);
    }

    const [existing] = await db.query('SELECT id, image_url, start_date, end_date FROM advertisements WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Advertisement not found' });

    const effectiveStart = start_date || (existing[0].start_date ? new Date(existing[0].start_date).toISOString().slice(0, 10) : null);
    const effectiveEnd = end_date || (existing[0].end_date ? new Date(existing[0].end_date).toISOString().slice(0, 10) : null);
    if (effectiveStart && effectiveEnd && effectiveEnd < effectiveStart) {
      return res.status(400).json({ error: 'end_date cannot be earlier than start_date' });
    }

    const finalImage = imageUrl !== undefined ? imageUrl : existing[0].image_url;

    await db.query(
      `UPDATE advertisements SET
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         description_mr = COALESCE(?, description_mr),
         phone = COALESCE(?, phone),
         redirect_url = COALESCE(?, redirect_url),
         image_url = ?,
         start_date = COALESCE(?, start_date),
         end_date = COALESCE(?, end_date),
         is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [title || null, description || null, description_mr || null, phone || null, redirect_url || null,
       finalImage, start_date || null, end_date || null,
       is_active !== undefined ? Number(is_active) : null, id]
    );

    const [rows] = await db.query('SELECT * FROM advertisements WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update ad error:', err);
    res.status(500).json({ error: 'Failed to update advertisement' });
  }
});

/* ── DELETE /:id – delete ad (auth required) ─────────────────── */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM advertisements WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Advertisement not found' });

    await db.query('DELETE FROM advertisements WHERE id = ?', [id]);
    res.json({ message: 'Advertisement deleted', id: Number(id) });
  } catch (err) {
    console.error('Delete ad error:', err);
    res.status(500).json({ error: 'Failed to delete advertisement' });
  }
});

module.exports = router;
