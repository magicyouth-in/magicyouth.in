/**
 * routes/events.js
 * CRUD API for Events management.
 * Rewritten to use MongoDB / Mongoose.
 */

const express = require('express');
const router = express.Router();
const Event = require('../database/models/Event');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'events');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  },
});

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * GET /api/events
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)  filter.status       = req.query.status;
    if (req.query.year)    filter.academicYear  = req.query.year;

    const events = await Event.find(filter).sort({ date: -1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/events/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: event });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * POST /api/events
 */
router.post('/', requireAuth, upload.single('poster_image'), async (req, res) => {
  try {
    const { title, date, venue, description, organizers, status, academic_year } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const event = await Event.create({
      title,
      date:         date || null,
      venue:        venue || null,
      description:  description || null,
      organizers:   organizers || null,
      status:       status || 'upcoming',
      posterImage:  req.file ? req.file.filename : null,
      academicYear: academic_year || null,
    });

    res.status(201).json({ success: true, data: event, message: 'Event created successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/events/:id
 */
router.put('/:id', requireAuth, upload.single('poster_image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const { title, date, venue, description, organizers, status, academic_year } = req.body;

    if (req.file) {
      if (event.posterImage) {
        const old = path.join(__dirname, '..', 'uploads', 'events', event.posterImage);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      event.posterImage = req.file.filename;
    }

    if (title)         event.title        = title;
    if (date)          event.date         = date;
    if (venue)         event.venue        = venue;
    if (description)   event.description  = description;
    if (organizers)    event.organizers   = organizers;
    if (status)        event.status       = status;
    if (academic_year) event.academicYear = academic_year;

    await event.save();
    res.json({ success: true, data: event, message: 'Event updated successfully.' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/events/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.posterImage) {
      const img = path.join(__dirname, '..', 'uploads', 'events', event.posterImage);
      if (fs.existsSync(img)) fs.unlinkSync(img);
    }

    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid event ID.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
