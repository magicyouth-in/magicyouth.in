/**
 * routes/timeline.js
 * Activity Timeline — MAGIC Youth Journey archive.
 * Rewritten to use MongoDB / Mongoose.
 */

const express = require('express');
const router = express.Router();
const Timeline = require('../database/models/Timeline');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/timeline
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.year) filter.academicYear = req.query.year;

    const items = await Timeline.find(filter)
      .populate('documentId', 'title filename category')
      .sort({ eventDate: -1, createdAt: -1 });

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/timeline/years
 */
router.get('/years', async (req, res) => {
  try {
    const years = await Timeline.distinct('academicYear', { academicYear: { $ne: null } });
    res.json({ success: true, data: years.sort().reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/timeline  — admin
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { event_id, event_name, event_date, description, photos, document_id, academic_year } = req.body;
    if (!event_name) return res.status(400).json({ success: false, message: 'Event name is required.' });

    const item = await Timeline.create({
      eventId:      event_id      || null,
      eventName:    event_name,
      eventDate:    event_date    || null,
      description:  description   || null,
      photos:       Array.isArray(photos) ? photos : (photos ? [photos] : []),
      documentId:   document_id   || null,
      academicYear: academic_year || null,
    });

    res.status(201).json({ success: true, data: item, message: 'Timeline entry added.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/timeline/:id  — admin
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const item = await Timeline.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Timeline entry not found.' });

    const { event_name, event_date, description, photos, document_id, academic_year } = req.body;

    if (event_name)              item.eventName    = event_name;
    if (event_date !== undefined) item.eventDate   = event_date;
    if (description !== undefined) item.description = description;
    if (photos !== undefined)    item.photos       = Array.isArray(photos) ? photos : (photos ? [photos] : []);
    if (document_id !== undefined) item.documentId = document_id || null;
    if (academic_year !== undefined) item.academicYear = academic_year;

    await item.save();
    res.json({ success: true, data: item, message: 'Timeline entry updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/timeline/:id  — admin
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const item = await Timeline.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Timeline entry not found.' });
    res.json({ success: true, message: 'Timeline entry deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
