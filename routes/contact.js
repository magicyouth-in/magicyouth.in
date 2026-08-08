/**
 * routes/contact.js
 * API router for contact message submissions & admin management.
 */

const express        = require('express');
const router         = express.Router();
const ContactMessage = require('../database/models/ContactMessage');
const Notification   = require('../database/models/Notification');
const AdminUser      = require('../database/models/AdminUser');
const { authenticateAdmin, requireAnyAdmin } = require('../middleware/auth');

/**
 * POST /api/contact — Public: submit a message
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, query } = req.body;
    const finalMessage = message || query;

    if (!name || !email || !finalMessage) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const contactMsg = await ContactMessage.create({
      name,
      email,
      phone:   phone   || '',
      subject: subject || 'General Inquiry',
      query:   finalMessage,
      status:  'New',
    });

    // Notify main admin via Socket.IO room
    try {
      const io        = req.app.get('io');
      const mainAdmin = await AdminUser.findOne({ role: 'MAIN_ADMIN' });
      if (mainAdmin) {
        const notification = await Notification.create({
          title:            'New Contact Message',
          message:          `Message from ${name} (${subject || 'General Inquiry'}).`,
          type:             'contact_message',
          entityType:       'ContactMessage',
          entityId:         contactMsg._id.toString(),
          recipientAdminId: mainAdmin._id,
          linkUrl:          '/admin',
          isRead:           false,
        });
        if (io) {
          io.to('main-admin').emit('new_notification', notification);
          io.to('main-admin').emit('new_contact_message', contactMsg);
        }
      }
    } catch (notifErr) {
      console.error('[CONTACT NOTIF ERROR]', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We will get back to you shortly.',
      data:    contactMsg,
    });
  } catch (err) {
    console.error('[CONTACT ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

/**
 * GET /api/contact — Admin: list messages
 */
router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(filter),
    ]);

    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/contact/:id/status — Admin: update status
 */
router.patch('/:id/status', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });

    if (status)              msg.status     = status;
    if (adminReply !== undefined) {
      msg.adminReply = adminReply;
      msg.status     = 'Replied';
    }
    await msg.save();
    res.json({ success: true, data: msg, message: 'Updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Legacy PUT alias
router.put('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  req.params.status = req.body.status;
  const { status, adminReply } = req.body;
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (status)                   msg.status     = status;
    if (adminReply !== undefined) { msg.adminReply = adminReply; msg.status = 'Replied'; }
    await msg.save();
    res.json({ success: true, data: msg, message: 'Updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/contact/:id — Admin
 */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
