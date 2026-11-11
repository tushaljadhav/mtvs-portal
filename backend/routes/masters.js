// routes/masters.js – Area & Region Master CRUD
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/* ── Public: List regions with their areas ───────────────────────── */
router.get('/regions', async (_req, res) => {
  try {
    const [regions] = await db.query('SELECT * FROM regions ORDER BY name ASC');
    const [areas] = await db.query('SELECT * FROM areas ORDER BY name ASC');

    const grouped = regions.map(r => ({
      ...r,
      areas: areas.filter(a => a.region_id === r.id)
    }));

    res.json(grouped);
  } catch (err) {
    console.error('Get regions error:', err);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

/* ── Public: List all areas with region info ────────────────────── */
router.get('/areas', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id, a.name, a.lat, a.lng, a.region_id,
        r.name AS region_name, r.name_mr AS region_name_mr,
        r.approver, r.phone
      FROM areas a
      JOIN regions r ON a.region_id = r.id
      ORDER BY a.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Get areas error:', err);
    res.status(500).json({ error: 'Failed to fetch areas' });
  }
});

/* ── Admin: Create Region ────────────────────────────────────────── */
router.post('/regions', requireAuth, async (req, res) => {
  try {
    if (req.admin.region) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admin can modify master regions' });
    }
    const { name, name_mr, approver, phone } = req.body;
    if (!name || !approver || !phone) {
      return res.status(400).json({ error: 'Name, Approver, and Phone are required' });
    }
    const [result] = await db.query(
      'INSERT INTO regions (name, name_mr, approver, phone) VALUES (?, ?, ?, ?)',
      [name.trim(), name_mr?.trim() || null, approver.trim(), phone.trim()]
    );
    res.status(201).json({ id: result.insertId, message: 'Region created' });
  } catch (err) {
    console.error('Create region error:', err);
    res.status(500).json({ error: 'Failed to create region' });
  }
});

/* ── Admin: Update Region ────────────────────────────────────────── */
router.put('/regions/:id', requireAuth, async (req, res) => {
  try {
    if (req.admin.region) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admin can modify master regions' });
    }
    const { name, name_mr, approver, phone } = req.body;
    if (!name || !approver || !phone) {
      return res.status(400).json({ error: 'Name, Approver, and Phone are required' });
    }
    const [result] = await db.query(
      'UPDATE regions SET name = ?, name_mr = ?, approver = ?, phone = ? WHERE id = ?',
      [name.trim(), name_mr?.trim() || null, approver.trim(), phone.trim(), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Region not found' });
    res.json({ message: 'Region updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A region with this name already exists' });
    }
    console.error('Update region error:', err);
    res.status(500).json({ error: 'Failed to update region' });
  }
});

/* ── Admin: Delete Region ────────────────────────────────────────── */
router.delete('/regions/:id', requireAuth, async (req, res) => {
  try {
    if (req.admin.region) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admin can delete master regions' });
    }
    const [assigned] = await db.query('SELECT COUNT(*) AS cnt FROM areas WHERE region_id = ?', [req.params.id]);
    if (assigned[0]?.cnt > 0) {
      return res.status(400).json({
        error: `Cannot delete region while ${assigned[0].cnt} area(s) are assigned to it. Delete or reassign those areas first.`
      });
    }
    const [result] = await db.query('DELETE FROM regions WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Region not found' });
    res.json({ message: 'Region deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Cannot delete region while areas are assigned to it.' });
    }
    console.error('Delete region error:', err);
    res.status(500).json({ error: 'Failed to delete region' });
  }
});

/* ── Admin: Create Area ──────────────────────────────────────────── */
router.post('/areas', requireAuth, async (req, res) => {
  try {
    if (req.admin.region) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admin can modify master areas' });
    }
    const { region_id, name, lat, lng } = req.body;
    if (!region_id || !name) {
      return res.status(400).json({ error: 'Region and Area Name are required' });
    }
    const parsedLat = lat !== undefined && lat !== '' && lat !== null ? Number(lat) : null;
    const parsedLng = lng !== undefined && lng !== '' && lng !== null ? Number(lng) : null;
    const [result] = await db.query(
      'INSERT INTO areas (region_id, name, lat, lng) VALUES (?, ?, ?, ?)',
      [region_id, name.trim(), Number.isFinite(parsedLat) ? parsedLat : null, Number.isFinite(parsedLng) ? parsedLng : null]
    );
    res.status(201).json({ id: result.insertId, message: 'Area created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'An area with this name already exists' });
    }
    console.error('Create area error:', err);
    res.status(500).json({ error: 'Failed to create area' });
  }
});

/* ── Admin: Update Area ──────────────────────────────────────────── */
router.put('/areas/:id', requireAuth, async (req, res) => {
  try {
    if (req.admin.region) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admin can modify master areas' });
    }
    const { region_id, name, lat, lng } = req.body;
    if (!region_id || !name) {
      return res.status(400).json({ error: 'Region and Area Name are required' });
    }
    const parsedLat = lat !== undefined && lat !== '' && lat !== null ? Number(lat) : null;
    const parsedLng = lng !== undefined && lng !== '' && lng !== null ? Number(lng) : null;
    const [result] = await db.query(
      'UPDATE areas SET region_id = ?, name = ?, lat = ?, lng = ? WHERE id = ?',
      [region_id, name.trim(), Number.isFinite(parsedLat) ? parsedLat : null, Number.isFinite(parsedLng) ? parsedLng : null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Area not found' });
    res.json({ message: 'Area updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'An area with this name already exists' });
    }
    console.error('Update area error:', err);
    res.status(500).json({ error: 'Failed to update area' });
  }
});

/* ── Admin: Delete Area ──────────────────────────────────────────── */
router.delete('/areas/:id', requireAuth, async (req, res) => {
  try {
    if (req.admin.region) {
      return res.status(403).json({ error: 'Forbidden: Only Super Admin can delete master areas' });
    }
    await db.query('DELETE FROM areas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Area deleted' });
  } catch (err) {
    console.error('Delete area error:', err);
    res.status(500).json({ error: 'Failed to delete area' });
  }
});

module.exports = router;
