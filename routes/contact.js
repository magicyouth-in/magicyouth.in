/**
 * routes/contact.js
 * API router for contact messages using Supabase PostgreSQL.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireAnyAdmin } = require('../middleware/auth');

/** POST /api/contact — Public: submit a message */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, query } = req.body;
    const finalMessage = message || query;

    if (!name || !email || !finalMessage) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const { data: contactMsg, error } = await supabase
      .from('contact_messages')
      .insert([{
        name,
        email,
        phone: phone || '',
        subject: subject || 'General Inquiry',
        query: finalMessage,
        status: 'New',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We will get back to you shortly.',
      data: { ...contactMsg, _id: contactMsg.id, message: contactMsg.query },
    });
  } catch (err) {
    console.error('[CONTACT ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

/** GET /api/contact — Admin: list messages */
router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let query = supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (req.query.status) query = query.eq('status', req.query.status);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const formatted = (data || []).map(c => ({
      ...c,
      _id: c.id,
      message: c.query,
      adminReply: c.admin_reply,
    }));

    res.json({ success: true, data: formatted, pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/contact/:id/status — Admin */
router.patch('/:id/status', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (adminReply !== undefined) {
      updates.admin_reply = adminReply;
      updates.status = 'Replied';
    }

    const { data: updated, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !updated) return res.status(404).json({ success: false, message: 'Message not found.' });

    res.json({ success: true, data: { ...updated, _id: updated.id, message: updated.query, adminReply: updated.admin_reply }, message: 'Updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/contact/:id — Admin */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
