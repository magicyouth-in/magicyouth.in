/**
 * routes/about.js
 * API for managing About page content sections.
 * Rewritten to use MongoDB / Mongoose.
 */

const express = require('express');
const router = express.Router();
const AboutContent = require('../database/models/AboutContent');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/about  — public: active sections only
 */
router.get('/', async (req, res) => {
  try {
    const rows = await AboutContent.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/about/all  — admin: all sections
 */
router.get('/all', requireAuth, async (req, res) => {
  try {
    const rows = await AboutContent.find().sort({ displayOrder: 1 });
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/about  — admin
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { section_key, title, content, icon, display_order, is_active } = req.body;
    if (!section_key || !title) {
      return res.status(400).json({ success: false, message: 'section_key and title are required.' });
    }

    const row = await AboutContent.create({
      sectionKey:   section_key.trim().toLowerCase().replace(/\s+/g, '_'),
      title,
      content:      content      || '',
      icon:         icon         || '',
      displayOrder: display_order || 0,
      isActive:     is_active !== false && is_active !== '0',
    });
    res.status(201).json({ success: true, data: row, message: 'Section created.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A section with this key already exists.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/about/:id  — admin
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const row = await AboutContent.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Section not found.' });

    const { title, content, icon, display_order, is_active } = req.body;
    if (title !== undefined)         row.title        = title;
    if (content !== undefined)       row.content      = content;
    if (icon !== undefined)          row.icon         = icon;
    if (display_order !== undefined) row.displayOrder = display_order;
    if (is_active !== undefined)     row.isActive     = is_active === true || is_active === '1' || is_active === 1;

    await row.save();
    res.json({ success: true, data: row, message: 'Section updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/about/:id  — admin
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const row = await AboutContent.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Section not found.' });
    res.json({ success: true, message: 'Section deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
