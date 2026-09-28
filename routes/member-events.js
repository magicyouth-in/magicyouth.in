/**
 * routes/member-events.js
 * Member Portal — event listing and event registration.
 * GET /api/member/events                  — list events (member or public)
 * POST /api/member/events/:id/register    — member registers for an event
 * DELETE /api/member/events/:id/register  — member cancels registration
 * GET /api/member/events/my-registrations — member's own registrations
 */

const express  = require('express');
const router   = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateMember } = require('../middleware/memberAuth');

// ─── GET UPCOMING EVENTS (member-visible) ──────────────────────────────────────

router.get('/', authenticateMember, async (req, res) => {
  try {
    let query = supabase
      .from('events')
      .select('*, units(name, code), academic_years(year)', { count: 'exact' })
      .in('status', ['Upcoming', 'Ongoing'])
      .order('date', { ascending: true });

    // Members see events for their unit OR events with no unit restriction
    // Show own unit events + global events
    // For simplicity: show all published events; member can register for any
    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.search) query = query.ilike('title', `%${req.query.search}%`);

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: events, count, error } = await query;
    if (error) throw error;

    // For each event, check if this member is registered
    const eventIds = (events || []).map(e => e.id);
    let registrationMap = {};
    if (eventIds.length > 0) {
      const { data: regs } = await supabase
        .from('event_registrations')
        .select('event_id, status')
        .eq('member_id', req.member.id)
        .in('event_id', eventIds);
      (regs || []).forEach(r => { registrationMap[r.event_id] = r.status; });
    }

    const formatted = (events || []).map(e => ({
      ...e,
      _id:              e.id,
      unitId:           e.unit_id ? { _id: e.unit_id, name: e.units?.name, code: e.units?.code } : null,
      academicYearId:   e.academic_year_id ? { _id: e.academic_year_id, year: e.academic_years?.year } : null,
      registrationEnabled: e.registration_enabled,
      startTime:        e.start_time,
      endTime:          e.end_time,
      myRegistration:   registrationMap[e.id] || null,
    }));

    res.json({ success: true, data: formatted, pagination: { page, limit, total: count || 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── MY REGISTRATIONS ──────────────────────────────────────────────────────────

router.get('/my-registrations', authenticateMember, async (req, res) => {
  try {
    const { data: regs, error } = await supabase
      .from('event_registrations')
      .select('*, events(id, title, date, start_time, end_time, location, status, poster, units(name))')
      .eq('member_id', req.member.id)
      .order('registered_at', { ascending: false });

    if (error) throw error;

    const formatted = (regs || []).map(r => ({
      id:             r.id,
      status:         r.status,
      registeredAt:   r.registered_at,
      event: r.events ? {
        id:        r.events.id,
        title:     r.events.title,
        date:      r.events.date,
        startTime: r.events.start_time,
        endTime:   r.events.end_time,
        location:  r.events.location,
        status:    r.events.status,
        poster:    r.events.poster,
        unitName:  r.events.units?.name || '',
      } : null,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── REGISTER FOR AN EVENT ────────────────────────────────────────────────────

router.post('/:eventId/register', authenticateMember, async (req, res) => {
  try {
    // Load event
    const { data: event, error: evErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.eventId)
      .single();

    if (evErr || !event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!event.registration_enabled) return res.status(400).json({ success: false, message: 'Registration is not enabled for this event.' });
    if (event.status === 'Completed' || event.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Registration is closed for this event.' });
    }

    // Check capacity
    if (event.capacity) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'Registered');
      if (count >= event.capacity) {
        return res.status(400).json({ success: false, message: 'This event is full. Registration is closed.' });
      }
    }

    // Prevent duplicate
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', event.id)
      .eq('member_id', req.member.id)
      .single();

    if (existing) {
      if (existing.status === 'Registered') {
        return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
      }
      // Re-register if previously cancelled
      const { data: updated, error: updErr } = await supabase
        .from('event_registrations')
        .update({ status: 'Registered', registered_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (updErr) throw updErr;
      return res.json({ success: true, message: 'Successfully registered for event.', data: updated });
    }

    const { data: reg, error: regErr } = await supabase
      .from('event_registrations')
      .insert([{
        event_id:  event.id,
        member_id: req.member.id,
        unit_id:   req.member.unitId,
        status:    'Registered',
      }])
      .select()
      .single();

    if (regErr) throw regErr;
    res.status(201).json({ success: true, message: 'Successfully registered for event.', data: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CANCEL REGISTRATION ──────────────────────────────────────────────────────

router.delete('/:eventId/register', authenticateMember, async (req, res) => {
  try {
    const { data: reg, error } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', req.params.eventId)
      .eq('member_id', req.member.id)
      .single();

    if (error || !reg) return res.status(404).json({ success: false, message: 'Registration not found.' });

    await supabase
      .from('event_registrations')
      .update({ status: 'Cancelled' })
      .eq('id', reg.id);

    res.json({ success: true, message: 'Registration cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN: LIST REGISTRATIONS FOR AN EVENT ───────────────────────────────────
// Mounted separately on /api/event-registrations

module.exports = router;
