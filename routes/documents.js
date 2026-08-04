/**
 * routes/documents.js
 * CRUD API for Documents/Reports management.
 * Rewritten to use MongoDB / Mongoose.
 */

const express = require('express');
const router = express.Router();
const Document = require('../database/models/Document');
const { VALID_CATEGORIES } = require('../database/models/Document');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'documents');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/pdf|jpeg|jpg|png|doc|docx/.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only PDF, image, and document files are allowed.'));
  },
});

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * GET /api/documents
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category     = req.query.category;
    if (req.query.year)     filter.academicYear = req.query.year;

    const docs = await Document.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/documents/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * POST /api/documents
 */
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file)  return res.status(400).json({ success: false, message: 'File is required.' });
    const { title, event_name, event_date, description, category, academic_year, is_downloadable } = req.body;
    if (!title)     return res.status(400).json({ success: false, message: 'Title is required.' });
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const doc = await Document.create({
      title,
      eventName:      event_name  || null,
      eventDate:      event_date  || null,
      filename:       req.file.filename,
      description:    description || null,
      category:       category    || 'Event Reports',
      academicYear:   academic_year || null,
      isDownloadable: is_downloadable !== 'false',
    });

    res.status(201).json({ success: true, data: doc, message: 'Document uploaded successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/documents/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

    const { title, event_name, event_date, description, category, academic_year, is_downloadable } = req.body;

    if (title)                    doc.title          = title;
    if (event_name  !== undefined) doc.eventName     = event_name;
    if (event_date  !== undefined) doc.eventDate     = event_date;
    if (description !== undefined) doc.description   = description;
    if (category)                  doc.category      = category;
    if (academic_year !== undefined) doc.academicYear = academic_year;
    if (is_downloadable !== undefined) doc.isDownloadable = is_downloadable === 'true' || is_downloadable === true;

    await doc.save();
    res.json({ success: true, data: doc, message: 'Document updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/documents/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

    const filePath = path.join(__dirname, '..', 'uploads', 'documents', doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
