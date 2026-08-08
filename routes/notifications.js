/**
 * routes/notifications.js
 * Admin notifications — unit-scoped, per-admin.
 */

const express      = require('express');
const router       = express.Router();
const Notification = require('../database/models/Notification');
const { authenticateAdmin, requireAnyAdmin } = require('../middleware/auth');

/**
 * GET /api/notifications — Admin: list notifications for the logged-in admin.
 */
router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const filter = { recipientAdminId: req.admin._id };
    if (req.query.unread === 'true') filter.isRead = false;

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [data, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientAdminId: req.admin._id, isRead: false }),
    ]);

    res.json({ success: true, data, unread, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/notifications/:id/read — Mark as read
 */
router.patch('/:id/read', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientAdminId: req.admin._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 */
router.patch('/mark-all-read', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    await Notification.updateMany({ recipientAdminId: req.admin._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/notifications/:id
 */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipientAdminId: req.admin._id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

module.exports = router;
