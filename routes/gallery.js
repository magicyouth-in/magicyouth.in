/**
 * routes/gallery.js
 * Gallery photo metadata CRUD. Images stored via Nextcloud/WebDAV.
 * Public: read photos + albums. Admin: upload/edit/delete with unit auth.
 */

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Gallery  = require('../database/models/Gallery');
const Event    = require('../database/models/Event');
const AcademicYear = require('../database/models/AcademicYear');
const Unit     = require('../database/models/Unit');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');
const webdav   = require('../utils/webdav');

const tmpDir = path.join(__dirname, '..', 'uploads', 'tmp');
const storage = multer.diskStorage({
  destination: (req, file, cb) => { fs.mkdirSync(tmpDir, { recursive: true }); cb(null, tmpDir); },
  filename:    (req, file, cb) => { cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`); },
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (/\.(jpeg|jpg|png|gif|webp)$/i.test(path.extname(file.originalname))) return cb(null, true);
  cb(new Error('Only image files allowed.'));
}});

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/** GET /api/gallery?unitId=&academicYearId=&eventId=&album=&page= */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.unitId)         filter.unitId         = req.query.unitId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
    if (req.query.eventId)        filter.eventId        = req.query.eventId;
    if (req.query.album)          filter.album          = req.query.album;

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip  = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      Gallery.find(filter)
        .populate('unitId', 'name code')
        .populate('academicYearId', 'year')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      Gallery.countDocuments(filter),
    ]);

    res.json({ success: true, data: photos, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/gallery/albums — distinct album names with cover + count */
router.get('/albums', async (req, res) => {
  try {
    const match = {};
    if (req.query.unitId)         match.unitId         = require('mongoose').Types.ObjectId(req.query.unitId);
    if (req.query.academicYearId) match.academicYearId = require('mongoose').Types.ObjectId(req.query.academicYearId);

    const albums = await Gallery.aggregate([
      { $match: match },
      { $group: { _id: { album: '$album', unitId: '$unitId', academicYearId: '$academicYearId' }, album: { $first: '$album' }, photoCount: { $sum: 1 }, coverPhoto: { $first: '$filePath' }, lastUpdated: { $max: '$createdAt' } } },
      { $sort: { lastUpdated: -1 } },
    ]);

    res.json({ success: true, data: albums });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/gallery/:id */
router.get('/:id', async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id)
      .populate('unitId', 'name code')
      .populate('academicYearId', 'year')
      .populate('eventId', 'title');
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });
    res.json({ success: true, data: photo });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** GET /api/gallery/file/:id — Serve file through backend */
router.get('/file/:id', async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });

    const buffer = await webdav.downloadFile(photo.filePath);
    const ext    = path.extname(photo.filePath).toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    res.set('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not retrieve file.' });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/** POST /api/gallery — Upload photo(s) */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.array('photos', 30), async (req, res) => {
  const tmpFiles = (req.files || []).map(f => f.path);
  try {
    const { unitId, academicYearId, eventId, album, category, title, description } = req.body;
    if (!unitId || !academicYearId) return res.status(400).json({ success: false, message: 'unitId and academicYearId are required.' });
    if (!tmpFiles.length)           return res.status(400).json({ success: false, message: 'At least one photo is required.' });
    if (!canAccessUnit(req.admin, unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const [unit, ay] = await Promise.all([Unit.findById(unitId), AcademicYear.findById(academicYearId)]);
    const docs = [];

    for (const tmpFile of tmpFiles) {
      const filename   = path.basename(tmpFile);
      const remotePath = webdav.buildPath({ unitCode: unit.code, year: ay.year, area: 'Gallery', filename });
      const filePath   = await webdav.uploadFile(tmpFile, remotePath);

      docs.push({ unitId, academicYearId, eventId: eventId || null, album: album || '', category: category || 'General', title: title || '', description: description || '', filePath });
    }

    await Gallery.insertMany(docs);
    await logAction(req, 'Upload Gallery Photos', 'Gallery', null, unitId);
    res.status(201).json({ success: true, message: `${docs.length} photo(s) uploaded.`, count: docs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    tmpFiles.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
  }
});

/** DELETE /api/gallery/:id */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });
    if (!canAccessUnit(req.admin, photo.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    try { await webdav.deleteFile(photo.filePath); } catch {}
    await Gallery.findByIdAndDelete(photo._id);
    await logAction(req, 'Delete Gallery Photo', 'Gallery', photo._id.toString(), photo.unitId);
    res.json({ success: true, message: 'Photo deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
