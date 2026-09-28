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

/** Helper to check if a unit is active (case-insensitive) */
const isActiveUnit = (u) => {
  const s = String(u.status || '').toLowerCase();
  return s === 'active' || s === '';
};

/** GET /api/units/default — Get the current default unit */
router.get('/default', async (req, res) => {
  try {
    // 1. Try to find unit where is_default = true and status is Active
    let { data: defaultUnit, error } = await supabase
      .from('units')
      .select('*')
      .eq('is_default', true)
      .maybeSingle();

    // If defaultUnit found and is active, return it
    if (defaultUnit && isActiveUnit(defaultUnit)) {
      return res.json({ success: true, data: { ...defaultUnit, _id: defaultUnit.id, isDefault: true } });
    }

    // 2. Fallback to any Active unit ordered by name
    const { data: allUnits } = await supabase
      .from('units')
      .select('*')
      .order('name', { ascending: true });

    const activeFallback = (allUnits || []).find(isActiveUnit) || allUnits?.[0] || null;

    if (!activeFallback) {
      return res.status(404).json({ success: false, message: 'No active units found.' });
    }

    return res.json({ success: true, data: { ...activeFallback, _id: activeFallback.id, isDefault: !!activeFallback.is_default } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/units — Public list with status filter */
router.get('/', async (req, res) => {
  try {
    let { data: units, error } = await supabase
      .from('units')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // If error (e.g. table schema transition), attempt simple select
      const retry = await supabase.from('units').select('*');
      if (retry.error) throw retry.error;
      units = retry.data;
    }

    let list = units || [];

    // Filter inactive units unless requested
    if (req.query.includeInactive !== 'true') {
      list = list.filter(u => {
        const s = String(u.status || '').toLowerCase();
        return s === 'active' || s === 'upcoming' || s === '';
      });
    }

    // Sort default unit to the very top, then by name
    list.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    const formatted = list.map(u => ({
      ...u,
      _id: u.id,
      isDefault: !!u.is_default,
      // Normalize status display casing
      status: String(u.status || '').toLowerCase() === 'upcoming' ? 'Upcoming' :
              String(u.status || '').toLowerCase() === 'inactive' ? 'Inactive' :
              String(u.status || '').toLowerCase() === 'archived' ? 'Archived' : 'Active'
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[UNITS GET ERROR]', err.message);
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

/** PATCH /api/units/:id/set-default — Set this unit as global default */
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
    try {
      await supabase
        .from('units')
        .update({ is_default: false })
        .neq('id', unitId);
    } catch (e) {
      // non-fatal if is_default column is in migration
    }

    // Set default on target unit
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

    if (isDefault) {
      try {
        await supabase.from('units').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {}
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
        try {
          await supabase.from('units').update({ is_default: false }).neq('id', req.params.id);
        } catch (e) {}
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

/** PATCH /api/units/:id/status — Toggle status */
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
