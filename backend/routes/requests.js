// routes/requests.js – Membership request CRUD + approval flow + analytics
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { upload, cloudinary } = require('../cloudinary');

const router = express.Router();

/* ── Helpers ─────────────────────────────────────────────────── */
function randomDigits(n) {
  return String(Math.floor(Math.random() * 10 ** n)).padStart(n, '0');
}
function generateRef() {
  return `REQ-${new Date().getFullYear()}-${randomDigits(5)}`;
}
function generateMemberId() {
  return `MTVS-${new Date().getFullYear()}-${randomDigits(5)}`;
}
function generateReceiptNo() {
  return `RCT-${new Date().getFullYear()}-${randomDigits(5)}`;
}

// Default area coords fallback
const AREA_COORDS = {
  'Dharavi':      { lat: 19.0425, lng: 72.8520 },
  'Dadar':        { lat: 19.0185, lng: 72.8428 },
  'Worli':        { lat: 18.9946, lng: 72.8232 },
  'Bandra':       { lat: 19.0544, lng: 72.8402 },
  'Andheri East': { lat: 19.1136, lng: 72.8697 },
  'Andheri West': { lat: 19.1197, lng: 72.8468 },
  'Malad':        { lat: 19.1800, lng: 72.8488 },
  'Borivali':     { lat: 19.2307, lng: 72.8567 },
  'Kurla':        { lat: 19.0718, lng: 72.8884 },
  'Chembur':      { lat: 19.0522, lng: 72.9005 },
  'Ghatkopar':    { lat: 19.0870, lng: 72.9096 },
  'Thane':        { lat: 19.2148, lng: 72.9786 },
};

/* ── PUBLIC ROUTES ───────────────────────────────────────────── */

// Multi-file upload for member photo, shop/business photo, and ID document proof
const memberUploads = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'shop_photo', maxCount: 1 },
  { name: 'doc_photo', maxCount: 1 },
]);

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

/* POST /api/requests
   Multipart form-data: all fields + optional photo, shop_photo, doc_photo files
*/
router.post('/', memberUploads, async (req, res) => {
  try {
    const { name, age, gender, phone, email, idType, idNumber,
            shop, workType, address, area, pincode } = req.body;

    if (!name || !age || !gender || !phone || !idType || !shop || !workType || !address || !area || !pincode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch coordinates dynamically from areas table
    const [areaRows] = await db.query('SELECT lat, lng FROM areas WHERE name = ? LIMIT 1', [area]);
    const coords = areaRows.length ? areaRows[0] : (AREA_COORDS[area] || {});

    // Photos: Member photo, Shop photo, ID document photo
    const photoUrl     = getFileUrl(req.files?.photo?.[0]);
    const shopPhotoUrl = getFileUrl(req.files?.shop_photo?.[0]);
    const docPhotoUrl  = getFileUrl(req.files?.doc_photo?.[0]);
    const photoPid     = req.files?.photo?.[0]?.filename || null;

    // Generate unique ref
    let ref;
    let attempts = 0;
    do {
      ref = generateRef();
      const [exists] = await db.query('SELECT id FROM requests WHERE ref = ?', [ref]);
      if (!exists.length) break;
    } while (++attempts < 10);

    await db.query(
      `INSERT INTO requests
        (ref, name, age, gender, phone, email, id_type, id_number,
         shop, work_type, address, area, pincode, lat, lng, 
         photo_url, photo_public_id, shop_photo_url, doc_photo_url)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [ref, name.trim(), parseInt(age), gender, phone.trim(), email?.trim() || null,
       idType, idNumber?.trim() || null, shop.trim(), workType, address.trim(),
       area, pincode.trim(), coords.lat || null, coords.lng || null, 
       photoUrl, photoPid, shopPhotoUrl, docPhotoUrl]
    );

    res.status(201).json({ ref });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

/* GET /api/requests/stats/summary – advanced dashboard metrics (placed before /:identifier) */
router.get('/stats/summary', requireAuth, async (req, res) => {
  try {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (req.admin.region) {
      whereClause += ' AND area IN (SELECT name FROM areas WHERE region_id IN (SELECT id FROM regions WHERE name = ?))';
      params.push(req.admin.region);
    }

    const [counts] = await db.query(`
      SELECT
        COUNT(*)                                              AS total,
        COALESCE(SUM(status = 'pending'), 0)                 AS pending,
        COALESCE(SUM(status = 'approved'), 0)                AS approved,
        COALESCE(SUM(status = 'paid'), 0)                    AS paid,
        COALESCE(SUM(status = 'rejected'), 0)                AS rejected,
        COALESCE(SUM(status = 'paid' AND DATE(paid_at) = CURDATE()), 0) AS paid_today,
        COALESCE(SUM(status = 'paid' AND paid_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)), 0) AS paid_this_month
      FROM requests
      ${whereClause}
    `, params);

    // Area breakdown
    const [byArea] = await db.query(`
      SELECT area, COUNT(*) as count,
             COALESCE(SUM(status = 'paid'), 0) as paid_count
      FROM requests
      ${whereClause}
      GROUP BY area
      ORDER BY count DESC
      LIMIT 10
    `, params);

    // Work Type breakdown
    const [byWorkType] = await db.query(`
      SELECT work_type, COUNT(*) as count
      FROM requests
      ${whereClause}
      GROUP BY work_type
      ORDER BY count DESC
    `, params);

    // Recent activity (last 10 records)
    const [recent] = await db.query(`
      SELECT ref, name, phone, shop, area, status, submitted_at, paid_at, member_id
      FROM requests
      ${whereClause}
      ORDER BY COALESCE(paid_at, submitted_at) DESC
      LIMIT 10
    `, params);

    // Monthly signups for last 6 months
    const [monthly] = await db.query(`
      SELECT 
        DATE_FORMAT(submitted_at, '%b %Y') as month,
        COUNT(*) as total,
        COALESCE(SUM(status = 'paid'), 0) as paid
      FROM requests
      ${whereClause}
        AND submitted_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(submitted_at, '%Y-%m'), DATE_FORMAT(submitted_at, '%b %Y')
      ORDER BY DATE_FORMAT(submitted_at, '%Y-%m') ASC
    `, params);

    const summary = {
      ...counts[0],
      totalRevenue: (Number(counts[0].paid) || 0) * 100,
      byArea,
      byWorkType,
      recent,
      monthly,
    };

    res.json(summary);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* GET /api/requests/pass/:memberId – load member pass by memberId, ref, or phone */
router.get('/pass/:memberId', async (req, res) => {
  try {
    const raw = req.params.memberId.trim();
    const [rows] = await db.query(
      `SELECT * FROM requests
       WHERE (member_id = ? OR ref = ? OR phone = ?)
         AND status = 'paid'
       ORDER BY id DESC LIMIT 1`,
      [raw, raw, raw]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Active member pass not found. Verification or payment may be pending.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get pass error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* GET /api/requests/:identifier – public: member checks status by ref OR phone */
router.get('/:identifier', async (req, res) => {
  try {
    const raw = req.params.identifier.trim();
    // Match by ref OR phone OR member_id
    const [rows] = await db.query(
      `SELECT * FROM requests 
       WHERE ref = ? OR phone = ? OR member_id = ?
       ORDER BY id DESC LIMIT 1`,
      [raw, raw, raw]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Application or member not found with this Reference or Phone Number' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ── ADMIN ROUTES (require JWT) ──────────────────────────────── */

/* GET /api/requests – list all requests (optionally filtered) */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, area, q } = req.query;
    let sql = 'SELECT * FROM requests WHERE 1=1';
    const params = [];

    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (area)   { sql += ' AND area = ?';   params.push(area); }
    if (q) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR ref LIKE ? OR member_id LIKE ? OR shop LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
    }

    // Regional admins see only their region
    if (req.admin.region) {
      sql += ' AND area IN (SELECT name FROM areas WHERE region_id IN (SELECT id FROM regions WHERE name = ?))';
      params.push(req.admin.region);
    }

    sql += ' ORDER BY submitted_at DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('List requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* PATCH /api/requests/:ref/decide
   Body: { action: 'approve'|'reject'|'pay', reasonKey? }
*/
router.patch('/:ref/decide', requireAuth, async (req, res) => {
  try {
    const { action, reasonKey, txnRef } = req.body;
    const { ref } = req.params;

    const [rows] = await db.query('SELECT * FROM requests WHERE ref = ?', [ref]);
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });

    const request = rows[0];

    // Enforce regional admin boundary if admin is scoped to a region
    if (req.admin.region) {
      const [areaMatch] = await db.query(
        `SELECT a.id FROM areas a
         JOIN regions r ON a.region_id = r.id
         WHERE a.name = ? AND r.name = ? LIMIT 1`,
        [request.area, req.admin.region]
      );
      if (!areaMatch.length) {
        return res.status(403).json({ error: 'Forbidden: application belongs to another region' });
      }
    }

    const now = new Date();
    let update = {};

    if (action === 'approve' && request.status === 'pending') {
      update = { status: 'approved', decided_at: now, decided_by: req.admin.id };
    } else if (action === 'reject' && request.status === 'pending') {
      update = {
        status: 'rejected',
        decided_at: now,
        decided_by: req.admin.id,
        reason_key: reasonKey || 'ID Document Unclear',
      };
    } else if (action === 'pay' && (request.status === 'approved' || request.status === 'pending')) {
      // Allow marking paid directly or from approved
      update = {
        status: 'paid',
        paid_at: now,
        decided_by: req.admin.id,
        member_id: request.member_id || generateMemberId(),
        receipt_no: request.receipt_no || generateReceiptNo(),
        txn_ref: (txnRef && String(txnRef).trim()) || request.txn_ref || randomDigits(12),
      };
    } else {
      return res.status(400).json({ error: `Invalid action "${action}" for status "${request.status}"` });
    }

    const fields = Object.keys(update).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(update), ref];
    await db.query(`UPDATE requests SET ${fields} WHERE ref = ?`, values);

    const [updated] = await db.query('SELECT * FROM requests WHERE ref = ?', [ref]);
    res.json(updated[0]);
  } catch (err) {
    console.error('Decide error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
