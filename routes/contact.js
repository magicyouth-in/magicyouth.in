/**
 * routes/contact.js
 * API router for contact message submissions & admin replies.
 */

const express = require('express');
const router = express.Router();

const ContactMessage = require('../database/models/ContactMessage');
const Notification = require('../database/models/Notification');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/contact
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, query } = req.body;
    const finalMessage = message || query;

    if (!name || !email || !finalMessage) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const contactMsg = new ContactMessage({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      query: finalMessage,
      status: 'New'
    });

    await contactMsg.save();

    // Create system notification
    const notification = new Notification({
      title: 'New Contact Message',
      message: `Message from ${name} (${subject || 'General Inquiry'}).`,
      type: 'contact_message',
      linkUrl: '/admin/contact-messages',
      isRead: false
    });
    await notification.save();

    // Emit Socket.IO real-time alert to admins
    const io = req.app.get('io');
    if (io) {
      io.emit('new_notification', notification);
      io.emit('new_contact_message', contactMsg);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We have received your message and will get back to you shortly.',
      data: contactMsg
    });

  } catch (err) {
    console.error('Contact Submission Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

/**
 * GET /api/contact (Admin)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/contact/:id (Admin status / reply)
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });

    if (status) msg.status = status;
    if (adminReply !== undefined) {
      msg.adminReply = adminReply;
      msg.status = 'Replied';
    }

    await msg.save();
    res.json({ success: true, message: 'Contact message updated.', data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/contact/:id (Admin)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Contact message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
