/**
 * routes/announcements.js
 * CRUD API for Announcements management.
 * Rewritten to use MongoDB / Mongoose.
 */

const express = require('express');
const router = express.Router();
const Announcement = require('../database/models/Announcement');
const { requireAuth } = require('../middleware/auth');

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * GET /api/announcements
 */
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === '1' ? {} : { isActive: true };
    const announcements = await Announcement.find(filter).sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * POST /api/announcements
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, priority, is_active } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const ann = await Announcement.create({
      title,
      content:  content  || null,
      priority: ['high', 'normal', 'low'].includes(priority) ? priority : 'normal',
      isActive: is_active !== '0',
    });
    res.status(201).json({ success: true, data: ann, message: 'Announcement created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/announcements/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found.' });

    const { title, content, priority, is_active } = req.body;
    if (title)    ann.title    = title;
    if (content !== undefined)  ann.content  = content;
    if (['high', 'normal', 'low'].includes(priority)) ann.priority = priority;
    if (is_active !== undefined) ann.isActive = is_active === '1' || is_active === true;

    await ann.save();
    res.json({ success: true, data: ann, message: 'Announcement updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/announcements/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
