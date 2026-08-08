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
    const { year, status } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (year) updates.year = year;
    if (status) updates.status = status;

    const { data: ay, error } = await supabase
      .from('academic_years')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !ay) return res.status(404).json({ success: false, message: 'Academic year not found.' });

    await logAction(req, 'Edit Academic Year', 'AcademicYear', ay.id, ay.unit_id);
    res.json({ success: true, data: { ...ay, _id: ay.id, unitId: ay.unit_id }, message: 'Academic year updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
