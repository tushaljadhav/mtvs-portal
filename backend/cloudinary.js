// cloudinary.js – Smart storage: Cloudinary if real keys, else local disk
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
require('dotenv').config();

const PLACEHOLDER_VALUES = ['your_cloud_name', 'your_api_key', 'your_api_secret'];

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey    = process.env.CLOUDINARY_API_KEY    || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

const hasRealKeys =
  cloudName && apiKey && apiSecret &&
  !PLACEHOLDER_VALUES.includes(cloudName) &&
  !PLACEHOLDER_VALUES.includes(apiKey) &&
  !PLACEHOLDER_VALUES.includes(apiSecret);

let storage;

if (hasRealKeys) {
  /* ── Cloudinary storage ─────────────────────────────────────── */
  cloudinary.config({
    cloud_name: cloudName,
    api_key:    apiKey,
    api_secret: apiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         'mtvs/member-photos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
    },
  });

  console.log('📷 Photo storage: Cloudinary');
} else {
  /* ── Local disk storage (fallback) ──────────────────────────── */
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename:    (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `photo-${uniqueSuffix}${ext}`);
    },
  });

  console.log('📷 Photo storage: Local disk (uploads/)');
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

module.exports = { cloudinary, upload };
