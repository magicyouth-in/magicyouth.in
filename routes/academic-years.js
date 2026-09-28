/**
 * routes/academic-years.js
 * CRUD for Academic Years linked to Units using Supabase PostgreSQL.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

/** GET /api/academic-years */
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('academic_years').select('*, units(name, code)').order('year', { ascending: false });
    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.status) query = query.eq('status', req.query.status);

    const { data: years, error } = await query;
    if (error) throw error;

    const formatted = (years || []).map(y => ({
      ...y,
      _id: y.id,
      unitId: y.unit_id ? { _id: y.unit_id, id: y.unit_id, name: y.units?.name || '', code: y.units?.code || '' } : null,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/academic-years/:id */
router.get('/:id', async (req, res) => {
  try {
    const { data: year, error } = await supabase
      .from('academic_years')
      .select('*, units(name, code)')
      .eq('id', req.params.id)
      .single();

    if (error || !year) return res.status(404).json({ success: false, message: 'Academic year not found.' });

    const formatted = {
      ...year,
      _id: year.id,
      unitId: year.unit_id ? { _id: year.unit_id, id: year.unit_id, name: year.units?.name || '', code: year.units?.code || '' } : null,
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** POST /api/academic-years */
router.post('/', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { unitId, year, status } = req.body;
    if (!unitId || !year) return res.status(400).json({ success: false, message: 'unitId and year are required.' });

    const { data: ay, error } = await supabase
      .from('academic_years')
      .insert([{
        unit_id: unitId,
        year,
        status: status || 'Active',
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Create Academic Year', 'AcademicYear', ay.id, unitId);
    res.status(201).json({ success: true, data: { ...ay, _id: ay.id, unitId: ay.unit_id }, message: 'Academic year created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/academic-years/:id */
router.put('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { year, status, unitId } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (year !== undefined) updates.year = String(year).trim();
    if (status !== undefined) updates.status = status;
    if (unitId) updates.unit_id = unitId;

    const { data: ay, error } = await supabase
      .from('academic_years')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, units(name, code)')
      .single();

    if (error || !ay) return res.status(404).json({ success: false, message: 'Academic year not found.' });

    await logAction(req, 'Edit Academic Year', 'AcademicYear', ay.id, ay.unit_id);
    res.json({
      success: true,
      data: { ...ay, _id: ay.id, unitId: ay.unit_id ? { _id: ay.unit_id, id: ay.unit_id, name: ay.units?.name || '', code: ay.units?.code || '' } : null },
      message: 'Academic year updated.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/academic-years/:id/status — Toggle status */
router.patch('/:id/status', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

    const { data: ay, error } = await supabase
      .from('academic_years')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*, units(name, code)')
      .single();

    if (error || !ay) return res.status(404).json({ success: false, message: 'Academic year not found.' });

    res.json({
      success: true,
      data: { ...ay, _id: ay.id, unitId: ay.unit_id ? { _id: ay.unit_id, id: ay.unit_id, name: ay.units?.name || '', code: ay.units?.code || '' } : null },
      message: `Academic year set to ${status}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/academic-years/:id — Safe delete with foreign key nullification */
router.delete('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const ayId = req.params.id;

    // Verify academic year exists
    const { data: existing, error: findErr } = await supabase
      .from('academic_years')
      .select('id, year, unit_id')
      .eq('id', ayId)
      .single();

    if (findErr || !existing) {
      return res.status(404).json({ success: false, message: 'Academic year not found.' });
    }

    // Safely set academic_year_id to NULL on referencing tables so NO CASCADE DELETION occurs
    await Promise.allSettled([
      supabase.from('teams').update({ academic_year_id: null }).eq('academic_year_id', ayId),
      supabase.from('members').update({ academic_year_id: null }).eq('academic_year_id', ayId),
      supabase.from('join_requests').update({ academic_year_id: null }).eq('academic_year_id', ayId),
      supabase.from('membership_drives').update({ academic_year_id: null }).eq('academic_year_id', ayId),
      supabase.from('events').update({ academic_year_id: null }).eq('academic_year_id', ayId),
      supabase.from('stories').update({ academic_year_id: null }).eq('academic_year_id', ayId),
      supabase.from('media').update({ academic_year_id: null }).eq('academic_year_id', ayId),
      supabase.from('documents').update({ academic_year_id: null }).eq('academic_year_id', ayId),
    ]);

    // Delete the academic year record
    const { error: delErr } = await supabase
      .from('academic_years')
      .delete()
      .eq('id', ayId);

    if (delErr) {
      return res.status(400).json({
        success: false,
        message: 'Could not delete academic year due to foreign key restrictions. You can set its status to Inactive instead.'
      });
    }

    await logAction(req, 'Delete Academic Year', 'AcademicYear', ayId, existing.unit_id);

    res.json({
      success: true,
      message: `Academic year "${existing.year}" safely removed. Related content retained.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
