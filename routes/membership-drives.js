/**
 * routes/membership-drives.js
 * API router for Membership Drives & Academic Year integration using Supabase PostgreSQL.
 * Allows Main Admin to configure drives, format Member IDs, set periods, and control intake cycles.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireAnyAdmin, requireMainAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

function mapDrive(d) {
  return {
    ...d,
    _id:            d.id,
    unitId:         d.unit_id ? { _id: d.unit_id, id: d.unit_id, name: d.units?.name || '', code: d.units?.code || '' } : null,
    academicYearId: d.academic_year_id ? { _id: d.academic_year_id, id: d.academic_year_id, year: d.academic_years?.year || '' } : null,
    academicYear:   d.academic_years?.year || '',
    unitName:       d.units?.name || '',
    unitCode:       d.units?.code || '',
    idFormat:       d.id_format || 'MAGIC-{UNIT}-{NUMBER}',
    startNumber:    d.start_number || 1,
    nextNumber:     d.next_number || 1,
    numberPadding:  d.number_padding || 3,
    startDate:      d.start_date,
    endDate:        d.end_date,
  };
}

/** GET /api/membership-drives/active — Public: Get currently OPEN drive for a unit */
router.get('/active', async (req, res) => {
  try {
    const { unitId } = req.query;
    if (!unitId) {
      return res.status(400).json({ success: false, message: 'unitId is required.' });
    }

    let { data: drive, error } = await supabase
      .from('membership_drives')
      .select('*, units(name, code), academic_years(year)')
      .eq('unit_id', unitId)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // If table doesn't exist yet, return no active drive gracefully
      return res.json({
        success: true,
        hasActiveDrive: false,
        data: null,
        message: 'No open membership drive for this chapter.'
      });
    }

    if (!drive) {
      return res.json({
        success: true,
        hasActiveDrive: false,
        data: null,
        message: 'No open membership drive for this chapter.'
      });
    }

    res.json({
      success: true,
      hasActiveDrive: true,
      data: mapDrive(drive)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/membership-drives — Admin: List all drives */
router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let query = supabase
      .from('membership_drives')
      .select('*, units(name, code), academic_years(year)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.academicYearId) query = query.eq('academic_year_id', req.query.academicYearId);

    // Unit access restriction for sub-admins
    if (req.admin.role === 'SUB_ADMIN' && req.admin.assigned_unit_ids?.length > 0) {
      query = query.in('unit_id', req.admin.assigned_unit_ids);
    }

    const { data: drives, count, error } = await query;
    if (error) {
      if (error.message?.includes('membership_drives') || error.code === 'PGRST204') {
        return res.json({ success: true, data: [], total: 0 });
      }
      throw error;
    }

    res.json({
      success: true,
      data: (drives || []).map(mapDrive),
      total: count || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/membership-drives/:id — Admin: Get drive detail */
router.get('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: drive, error } = await supabase
      .from('membership_drives')
      .select('*, units(name, code), academic_years(year)')
      .eq('id', req.params.id)
      .single();

    if (error || !drive) {
      return res.status(404).json({ success: false, message: 'Membership drive not found.' });
    }

    if (drive.unit_id && !canAccessUnit(req.admin, drive.unit_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    res.json({ success: true, data: mapDrive(drive) });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** POST /api/membership-drives — Main Admin: Create Membership Drive */
router.post('/', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const {
      name, unitId, academicYearId, startDate, endDate, status,
      idFormat, startNumber, numberPadding, description
    } = req.body;

    if (!name || !unitId) {
      return res.status(400).json({ success: false, message: 'Drive Name and Unit are required.' });
    }

    const startingNum = parseInt(startNumber) || 1;
    const padding = parseInt(numberPadding) || 3;
    const initialStatus = ['DRAFT', 'UPCOMING', 'OPEN', 'CLOSED'].includes(status) ? status : 'DRAFT';

    // If setting to OPEN, check and optionally close other open drives for the same unit
    if (initialStatus === 'OPEN') {
      await supabase
        .from('membership_drives')
        .update({ status: 'CLOSED', updated_at: new Date().toISOString() })
        .eq('unit_id', unitId)
        .eq('status', 'OPEN');
    }

    const { data: drive, error } = await supabase
      .from('membership_drives')
      .insert([{
        name:             name.trim(),
        unit_id:          unitId,
        academic_year_id: academicYearId || null,
        start_date:       startDate || null,
        end_date:         endDate || null,
        status:           initialStatus,
        id_format:        idFormat?.trim() || 'MAGIC-{UNIT}-{NUMBER}',
        start_number:     startingNum,
        next_number:      startingNum,
        number_padding:   padding,
        description:      description || '',
      }])
      .select('*, units(name, code), academic_years(year)')
      .single();

    if (error) throw error;

    await logAction(req, 'Create Membership Drive', 'MembershipDrive', drive.id, unitId);
    res.status(201).json({
      success: true,
      message: `Membership drive "${drive.name}" created successfully.`,
      data: mapDrive(drive)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/membership-drives/:id — Main Admin: Edit Membership Drive */
router.put('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const {
      name, unitId, academicYearId, startDate, endDate, status,
      idFormat, startNumber, nextNumber, numberPadding, description
    } = req.body;

    const { data: existing } = await supabase.from('membership_drives').select('*').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Drive not found.' });

    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name.trim();
    if (unitId) updates.unit_id = unitId;
    if (academicYearId !== undefined) updates.academic_year_id = academicYearId || null;
    if (startDate !== undefined) updates.start_date = startDate || null;
    if (endDate !== undefined) updates.end_date = endDate || null;
    if (idFormat) updates.id_format = idFormat.trim();
    if (startNumber !== undefined) updates.start_number = parseInt(startNumber) || 1;
    if (nextNumber !== undefined) updates.next_number = parseInt(nextNumber) || 1;
    if (numberPadding !== undefined) updates.number_padding = parseInt(numberPadding) || 3;
    if (description !== undefined) updates.description = description;

    if (status && ['DRAFT', 'UPCOMING', 'OPEN', 'CLOSED'].includes(status)) {
      updates.status = status;
      if (status === 'OPEN') {
        const targetUnitId = unitId || existing.unit_id;
        await supabase
          .from('membership_drives')
          .update({ status: 'CLOSED', updated_at: new Date().toISOString() })
          .eq('unit_id', targetUnitId)
          .eq('status', 'OPEN')
          .neq('id', req.params.id);
      }
    }

    const { data: updated, error } = await supabase
      .from('membership_drives')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, units(name, code), academic_years(year)')
      .single();

    if (error) throw error;

    await logAction(req, 'Edit Membership Drive', 'MembershipDrive', updated.id, updated.unit_id);
    res.json({
      success: true,
      message: `Membership drive "${updated.name}" updated.`,
      data: mapDrive(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/membership-drives/:id/status — Update Status (DRAFT/UPCOMING/OPEN/CLOSED) */
router.patch('/:id/status', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'UPCOMING', 'OPEN', 'CLOSED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be DRAFT, UPCOMING, OPEN, or CLOSED.' });
    }

    const { data: drive } = await supabase.from('membership_drives').select('*').eq('id', req.params.id).single();
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });

    if (status === 'OPEN') {
      await supabase
        .from('membership_drives')
        .update({ status: 'CLOSED', updated_at: new Date().toISOString() })
        .eq('unit_id', drive.unit_id)
        .eq('status', 'OPEN')
        .neq('id', drive.id);
    }

    const { data: updated, error } = await supabase
      .from('membership_drives')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', drive.id)
      .select('*, units(name, code), academic_years(year)')
      .single();

    if (error) throw error;

    await logAction(req, `Change Drive Status to ${status}`, 'MembershipDrive', drive.id, drive.unit_id);
    res.json({
      success: true,
      message: `Drive status changed to ${status}.`,
      data: mapDrive(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/membership-drives/:id — Delete Drive */
router.delete('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { data: drive } = await supabase.from('membership_drives').select('*').eq('id', req.params.id).single();
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });

    await supabase.from('membership_drives').delete().eq('id', drive.id);
    await logAction(req, 'Delete Membership Drive', 'MembershipDrive', drive.id, drive.unit_id);

    res.json({ success: true, message: 'Membership drive deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
