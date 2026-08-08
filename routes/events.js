/**
 * routes/events.js
 * CRUD for Events, linked to Unit and Academic Year.
 * Public: filtered listing. Admin: full CRUD with unit authorization.
 */

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const Event   = require('../database/models/Event');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');
const webdav  = require('../utils/webdav');
const AcademicYear = require('../database/models/AcademicYear');
const Unit    = require('../database/models/Unit');

// Temp upload directory (files are moved to Nextcloud/local after validation)
const tmpDir = path.join(__dirname, '..', 'uploads', 'tmp');
const storage = multer.diskStorage({
  destination: (req, file, cb) => { try { fs.mkdirSync(tmpDir, { recursive: true }); } catch {} cb(null, tmpDir); },
  filename:    (req, file, cb) => { cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`); },
});
const imageFilter = (req, file, cb) => {
  const allowed = /\.(jpeg|jpg|png|gif|webp)$/i;
  if (!allowed.test(path.extname(file.originalname))) return cb(new Error('Only image files are allowed.'));
  cb(null, true);
};
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFilter });

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/** GET /api/events */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.unitId)         filter.unitId         = req.query.unitId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
    if (req.query.status)         filter.status         = req.query.status;
    if (req.query.category)       filter.category       = req.query.category;
    if (req.query.search) {
      filter.title = { $regex: new RegExp(req.query.search, 'i') };
    }

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('unitId', 'name code')
        .populate('academicYearId', 'year')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    res.json({ success: true, data: events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/events/:id */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('unitId', 'name code')
      .populate('academicYearId', 'year');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid event ID.' });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/** POST /api/events */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const { title, description, unitId, academicYearId, category, status, date, startTime, endTime, location, registrationEnabled, organizers } = req.body;
    if (!title || !unitId || !academicYearId) return res.status(400).json({ success: false, message: 'Title, unitId, and academicYearId are required.' });

    if (!canAccessUnit(req.admin, unitId)) return res.status(403).json({ success: false, message: 'Forbidden. No access to this Unit.' });

    let posterPath = null;
    if (tmpFile) {
      const [unit, ay] = await Promise.all([Unit.findById(unitId), AcademicYear.findById(academicYearId)]);
      const remotePath = webdav.buildPath({ unitCode: unit.code, year: ay.year, area: 'Events', filename: path.basename(tmpFile) });
      posterPath = await webdav.uploadFile(tmpFile, remotePath);
    }

    const event = await Event.create({
      title, description, unitId, academicYearId,
      category:            category       || 'Other',
      status:              status         || 'Upcoming',
      date:                date           || null,
      startTime:           startTime      || null,
      endTime:             endTime        || null,
      location:            location       || '',
      poster:              posterPath,
      registrationEnabled: registrationEnabled === 'true',
      organizers:          organizers     || '',
    });

    await logAction(req, 'Create Event', 'Event', event._id.toString(), unitId);
    const io = req.app.get('io');
    if (io) io.emit('event-updated', { action: 'create', event });
    res.status(201).json({ success: true, data: event, message: 'Event created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

/** PUT /api/events/:id */
router.put('/:id', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!canAccessUnit(req.admin, event.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    if (tmpFile) {
      if (event.poster) { try { await webdav.deleteFile(event.poster); } catch {} }
      const [unit, ay] = await Promise.all([Unit.findById(event.unitId), AcademicYear.findById(event.academicYearId)]);
      const remotePath = webdav.buildPath({ unitCode: unit.code, year: ay.year, area: 'Events', filename: path.basename(tmpFile) });
      event.poster = await webdav.uploadFile(tmpFile, remotePath);
    }

    const fields = ['title', 'description', 'category', 'status', 'date', 'startTime', 'endTime', 'location', 'organizers'];
    fields.forEach(f => { if (req.body[f] !== undefined) event[f] = req.body[f]; });
    if (req.body.registrationEnabled !== undefined) event.registrationEnabled = req.body.registrationEnabled === 'true';

    await event.save();
    await logAction(req, 'Edit Event', 'Event', event._id.toString(), event.unitId);
    const io = req.app.get('io');
    if (io) io.emit('event-updated', { action: 'update', event });
    res.json({ success: true, data: event, message: 'Event updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

/** DELETE /api/events/:id */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!canAccessUnit(req.admin, event.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    if (event.poster) { try { await webdav.deleteFile(event.poster); } catch {} }

    await Event.findByIdAndDelete(event._id);
    await logAction(req, 'Delete Event', 'Event', event._id.toString(), event.unitId);
    const io = req.app.get('io');
    if (io) io.emit('event-updated', { action: 'delete', eventId: event._id });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
