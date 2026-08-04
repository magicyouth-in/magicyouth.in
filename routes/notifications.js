/**
 * routes/notifications.js
 * Visitor-facing popup/banner notifications.
 * Rewritten to use MongoDB / Mongoose.
 */

const express = require('express');
const router = express.Router();
const Notification = require('../database/models/Notification');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/notifications  — public: active, non-expired
 */
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const rows = await Notification.find({
      isActive:  true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gte: today } },
      ],
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/notifications/all  — admin
 */
router.get('/all', requireAuth, async (req, res) => {
  try {
    const rows = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/notifications/:id  — admin
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const row = await Notification.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/notifications  — admin
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, message, type, link_text, link_url, show_popup, is_active, expires_at } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const row = await Notification.create({
      title,
      message:   message    || '',
      type:      type       || 'info',
      linkText:  link_text  || '',
      linkUrl:   link_url   || '',
      showPopup: !!show_popup,
      isActive:  is_active !== false && is_active !== '0',
      expiresAt: expires_at || null,
    });
    res.status(201).json({ success: true, data: row, message: 'Notification created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/notifications/:id  — admin
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const row = await Notification.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Notification not found.' });

    const { title, message, type, link_text, link_url, show_popup, is_active, expires_at } = req.body;
    if (title !== undefined)      row.title     = title;
    if (message !== undefined)    row.message   = message;
    if (type !== undefined)       row.type      = type;
    if (link_text !== undefined)  row.linkText  = link_text;
    if (link_url !== undefined)   row.linkUrl   = link_url;
    if (show_popup !== undefined) row.showPopup = !!show_popup;
    if (is_active !== undefined)  row.isActive  = is_active === true || is_active === '1' || is_active === 1;
    if (expires_at !== undefined) row.expiresAt = expires_at || null;

    await row.save();
    res.json({ success: true, data: row, message: 'Notification updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/notifications/:id  — admin
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const row = await Notification.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
