/**
 * routes/unit-announcements.js
 * Unit-aware announcements for the Member Portal.
 * Stored in Supabase (not MongoDB) so unit_id filtering works.
 *
 * Admin: POST/PUT/DELETE /api/unit-announcements
 * Member: GET /api/unit-announcements (filtered by member's unit)
 * Public: not exposed directly
 */

const express  = require('express');
const router   = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { authenticateMember } = require('../middleware/memberAuth');

// ─── MEMBER: GET ANNOUNCEMENTS FOR MY UNIT ───────────────────────────────────

router.get('/my', authenticateMember, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('unit_announcements')
      .select('id, title, content, priority, is_global, unit_id, units(name), created_at')
      .eq('is_active', true)
      .or(`unit_id.eq.${req.member.unitId},is_global.eq.true`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN: LIST ALL (with unit filter) ──────────────────────────────────────

router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let query = supabase
      .from('unit_announcements')
      .select('*, units(name, code)', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Unit isolation for sub-admins
    if (req.admin.role === 'SUB_ADMIN' && req.admin.assigned_unit_ids?.length > 0) {
      query = query.in('unit_id', req.admin.assigned_unit_ids);
    }

    if (req.query.unitId)   query = query.eq('unit_id', req.query.unitId);
    if (req.query.isGlobal) query = query.eq('is_global', req.query.isGlobal === 'true');

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [], pagination: { page, limit, total: count || 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN: CREATE ────────────────────────────────────────────────────────────

router.post('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { title, content, priority, unitId, isGlobal, isActive } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    // Unit admins can only post to their units
    if (unitId && !canAccessUnit(req.admin, unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    // Only main admin can create global announcements
    const global = req.admin.role === 'MAIN_ADMIN' && (isGlobal === true || isGlobal === 'true');

    const { data, error } = await supabase
      .from('unit_announcements')
      .insert([{
        title,
        content:    content || '',
        priority:   ['high', 'normal', 'low'].includes(priority) ? priority : 'normal',
        unit_id:    unitId || null,
        is_global:  global,
        is_active:  isActive !== false && isActive !== 'false',
        created_by: req.admin.id,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data, message: 'Announcement created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN: UPDATE ────────────────────────────────────────────────────────────

router.put('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('unit_announcements').select('*').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    if (existing.unit_id && !canAccessUnit(req.admin, existing.unit_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const updates = { updated_at: new Date().toISOString() };
    const fields  = ['title', 'content', 'priority'];
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (req.body.isActive  !== undefined) updates.is_active  = req.body.isActive  === true || req.body.isActive  === 'true';
    if (req.admin.role === 'MAIN_ADMIN' && req.body.isGlobal !== undefined) {
      updates.is_global = req.body.isGlobal === true || req.body.isGlobal === 'true';
    }

    const { data, error } = await supabase
      .from('unit_announcements')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data, message: 'Announcement updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN: DELETE ────────────────────────────────────────────────────────────

router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('unit_announcements').select('unit_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    if (existing.unit_id && !canAccessUnit(req.admin, existing.unit_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await supabase.from('unit_announcements').delete().eq('id', req.params.id);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
