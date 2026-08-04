/**
 * routes/gallery.js
 * CRUD API for Gallery management (event-wise photo albums).
 * Rewritten to use MongoDB / Mongoose.
 */

const express = require('express');
const router = express.Router();
const Gallery = require('../database/models/Gallery');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'gallery');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  },
});

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * GET /api/gallery
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.event) filter.eventName    = { $regex: new RegExp(`^${req.query.event}$`, 'i') };
    if (req.query.year)  filter.academicYear = req.query.year;

    const photos = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/gallery/albums
 * Returns distinct event albums with cover photo and count.
 * MUST be before /:id to avoid 'albums' being cast as ObjectId.
 */
router.get('/albums', async (req, res) => {
  try {
    const matchStage = {};
    if (req.query.year) matchStage.academicYear = req.query.year;

    const albums = await Gallery.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:          { eventName: '$eventName', academicYear: '$academicYear' },
          eventName:    { $first: '$eventName' },
          academicYear: { $first: '$academicYear' },
          photoCount:   { $sum: 1 },
          coverPhoto:   { $first: '$filename' },
          lastUpdated:  { $max: '$createdAt' },
        },
      },
      { $sort: { lastUpdated: -1 } },
    ]);

    res.json({ success: true, data: albums });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/gallery/years
 * MUST be before /:id to avoid 'years' being cast as ObjectId.
 */
router.get('/years', async (req, res) => {
  try {
    const years = await Gallery.distinct('academicYear', { academicYear: { $ne: null } });
    res.json({ success: true, data: years.sort().reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/gallery/:id  — must come AFTER named sub-routes
 */
router.get('/:id', async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });
    res.json({ success: true, data: photo });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid photo ID.' });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * POST /api/gallery
 * Upload multiple photos for an event album.
 */
router.post('/', requireAuth, upload.array('photos', 30), async (req, res) => {
  try {
    const { event_name, event_id, caption, academic_year } = req.body;
    if (!event_name)            return res.status(400).json({ success: false, message: 'Event name is required.' });
    if (!req.files?.length)     return res.status(400).json({ success: false, message: 'At least one photo is required.' });

    const docs = req.files.map(f => ({
      eventId:      event_id || null,
      eventName:    event_name,
      filename:     f.filename,
      caption:      caption || null,
      academicYear: academic_year || null,
    }));

    await Gallery.insertMany(docs);
    res.status(201).json({ success: true, message: `${req.files.length} photo(s) uploaded successfully.`, count: req.files.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/gallery/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });

    const { caption, event_name, academic_year } = req.body;
    if (caption      !== undefined) photo.caption      = caption;
    if (event_name)                 photo.eventName    = event_name;
    if (academic_year !== undefined) photo.academicYear = academic_year;

    await photo.save();
    res.json({ success: true, message: 'Photo updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/gallery/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const photo = await Gallery.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });

    const filePath = path.join(__dirname, '..', 'uploads', 'gallery', photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Photo deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
