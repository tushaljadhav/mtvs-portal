// server.js – Express entry point
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db            = require('./db');
const authRoutes    = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const masterRoutes  = require('./routes/masters');
const adsRoutes     = require('./routes/ads');

const app  = express();
const PORT = process.env.PORT || 4000;

/* ── Permissive CORS for local & cross-origin frontend ───────── */
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

/* ── Security ─────────────────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many login attempts. Try again later.' }
}));
app.use('/api/requests', rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  message: { error: 'Rate limit exceeded.' }
}));

/* ── Body parsers ─────────────────────────────────────────────── */
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

/* ── Serve static uploaded files directly ─────────────────────── */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

/* ── Serve frontend static files directly on port 4000 ────────── */
const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
} else {
  app.use(express.static(path.resolve(__dirname, '..')));
}

/* ── API Routes ───────────────────────────────────────────────── */
app.use('/api/auth',     authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/masters',  masterRoutes);
app.use('/api/ads',      adsRoutes);

// Pass lookup endpoint
app.get('/api/pass/:memberId', async (req, res) => {
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
    console.error('Pass lookup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ── Health check ─────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

/* ── SPA Fallback (Express 5 compatible) ───────────────────────── */
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    const indexHtml = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
  }
  next();
});

/* ── Global error handler ─────────────────────────────────────── */
app.use((err, req, res, _next) => {
  console.error('Unhandled error on', req.method, req.url, ':', err);
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 MTVS API running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend accessible at http://localhost:${PORT}`);
  console.log(`📁 Local uploads served at http://localhost:${PORT}/uploads`);
});
