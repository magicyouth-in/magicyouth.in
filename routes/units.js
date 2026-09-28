/**
 * routes/units.js
 * CRUD for MAGIC Youth Units using Supabase PostgreSQL.
 * Supports default unit selection, active/upcoming status, and full unit attributes.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

/** GET /api/units/default — Get the current default unit */
router.get('/default', async (req, res) => {
  try {
    // 1. Try to find unit where is_default = true and status = 'Active'
    let { data: defaultUnit, error } = await supabase
      .from('units')
      .select('*')
      .eq('is_default', true)
      .eq('status', 'Active')
      .maybeSingle();

    // 2. If none marked default, fallback to any Active unit
    if (!defaultUnit) {
      const { data: fallback } = await supabase
        .from('units')
        .select('*')
        .eq('status', 'Active')
        .order('name', { ascending: true })
        .limit(1);
      defaultUnit = fallback?.[0] || null;
    }

    if (!defaultUnit) {
      return res.status(404).json({ success: false, message: 'No active units found.' });
    }

    return res.json({ success: true, data: { ...defaultUnit, _id: defaultUnit.id } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/units — Public list with status filter */
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('units').select('*').order('is_default', { ascending: false }).order('name', { ascending: true });
    if (req.query.includeInactive !== 'true') {
      query = query.in('status', ['Active', 'Upcoming']);
    }
    const { data: units, error } = await query;
    if (error) throw error;

    const formatted = (units || []).map(u => ({ ...u, _id: u.id, isDefault: !!u.is_default }));
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
    res.json({ success: true, data: { ...unit, _id: unit.id, isDefault: !!unit.is_default } });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid unit ID.' });
  }
});

/** PATCH /api/units/:id/set-default — Set this unit as the global default unit (Main Admin only) */
router.patch('/:id/set-default', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const unitId = req.params.id;

    // Check if unit exists
    const { data: targetUnit, error: checkError } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single();

    if (checkError || !targetUnit) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    // Unset default from all other units
    await supabase
      .from('units')
      .update({ is_default: false })
      .neq('id', unitId);

    // Set default on this unit
    const { data: updated, error: updateError } = await supabase
      .from('units')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', unitId)
      .select()
      .single();

    if (updateError) throw updateError;

    await logAction(req, 'Set Default Unit', 'Unit', unitId, unitId);
    return res.json({
      success: true,
      message: `Default unit set to ${updated.name}.`,
      data: { ...updated, _id: updated.id, isDefault: true }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/units — Create (Main Admin only) */
router.post('/', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, code, institution, location, description, status, isDefault } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required.' });

    // If marked as default, clear default from others first
    if (isDefault) {
      await supabase.from('units').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data: unit, error } = await supabase
      .from('units')
      .insert([{
        name: name.trim(),
        code: code.trim().toUpperCase(),
        institution: institution || '',
        location: location || '',
        description: description || '',
        status: status || 'Active',
        is_default: !!isDefault,
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Create Unit', 'Unit', unit.id, unit.id);
    res.status(201).json({ success: true, data: { ...unit, _id: unit.id, isDefault: !!unit.is_default }, message: 'Unit created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/units/:id — Edit (Main Admin only) */
router.put('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, code, institution, location, description, status, isDefault } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (code !== undefined) updates.code = code.trim().toUpperCase();
    if (institution !== undefined) updates.institution = institution;
    if (location !== undefined) updates.location = location;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    if (isDefault !== undefined) {
      updates.is_default = !!isDefault;
      if (isDefault) {
        // Unset from others
        await supabase.from('units').update({ is_default: false }).neq('id', req.params.id);
      }
    }

    const { data: unit, error } = await supabase
      .from('units')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    await logAction(req, 'Edit Unit', 'Unit', unit.id, unit.id);
    res.json({ success: true, data: { ...unit, _id: unit.id, isDefault: !!unit.is_default }, message: 'Unit updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/units/:id/status — Toggle status (Active/Upcoming/Inactive/Archived) */
router.patch('/:id/status', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Active', 'Upcoming', 'Inactive', 'Archived'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
    }

    const { data: unit, error } = await supabase
      .from('units')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    await logAction(req, `Set Unit Status ${status}`, 'Unit', unit.id, unit.id);
    res.json({ success: true, message: `Unit status set to ${status}.`, data: { ...unit, _id: unit.id } });
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
    res.json({ success: true, message: 'Unit activated.', data: { ...unit, _id: unit.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
