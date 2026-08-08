/**
 * routes/units.js
 * CRUD for MAGIC Youth Units using Supabase PostgreSQL.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

/** GET /api/units — Public list */
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('units').select('*').order('name', { ascending: true });
    if (req.query.includeInactive !== 'true') {
      query = query.eq('status', 'Active');
    }
    const { data: units, error } = await query;
    if (error) throw error;

    const formatted = (units || []).map(u => ({ ...u, _id: u.id }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/units/:id — Public detail */
router.get('/:id', async (req, res) => {
  try {
    const { data: unit, error } = await supabase.from('units').select('*').eq('id', req.params.id).single();
    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });
    res.json({ success: true, data: { ...unit, _id: unit.id } });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid unit ID.' });
  }
});

/** POST /api/units — Create (Main Admin only) */
router.post('/', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, code, institution, location, description, status } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required.' });

    const { data: unit, error } = await supabase
      .from('units')
      .insert([{
        name,
        code,
        institution: institution || '',
        location: location || '',
        description: description || '',
        status: status || 'Active',
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Create Unit', 'Unit', unit.id, unit.id);
    res.status(201).json({ success: true, data: { ...unit, _id: unit.id }, message: 'Unit created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/units/:id — Edit (Main Admin only) */
router.put('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, code, institution, location, description, status } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (code !== undefined) updates.code = code;
    if (institution !== undefined) updates.institution = institution;
    if (location !== undefined) updates.location = location;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const { data: unit, error } = await supabase
      .from('units')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    await logAction(req, 'Edit Unit', 'Unit', unit.id, unit.id);
    res.json({ success: true, data: { ...unit, _id: unit.id }, message: 'Unit updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/units/:id/archive */
router.patch('/:id/archive', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { data: unit, error } = await supabase
      .from('units')
      .update({ status: 'Archived', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    await logAction(req, 'Archive Unit', 'Unit', unit.id, unit.id);
    res.json({ success: true, message: 'Unit archived.', data: { ...unit, _id: unit.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/units/:id/unarchive */
router.patch('/:id/unarchive', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { data: unit, error } = await supabase
      .from('units')
      .update({ status: 'Active', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    await logAction(req, 'Unarchive Unit', 'Unit', unit.id, unit.id);
    res.json({ success: true, message: 'Unit unarchived.', data: { ...unit, _id: unit.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
