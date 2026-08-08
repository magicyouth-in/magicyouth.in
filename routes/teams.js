/**
 * routes/teams.js
 * CRUD for Teams and Team Members using Supabase PostgreSQL.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

/** GET /api/teams */
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('teams').select('*, units(name, code), academic_years(year)').order('created_at', { ascending: false });
    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.academicYearId) query = query.eq('academic_year_id', req.query.academicYearId);

    const { data: teams, error } = await query;
    if (error) throw error;

    const formatted = (teams || []).map(t => ({
      ...t,
      _id: t.id,
      unitId: t.unit_id ? { _id: t.unit_id, id: t.unit_id, name: t.units?.name || '', code: t.units?.code || '' } : null,
      academicYearId: t.academic_year_id ? { _id: t.academic_year_id, id: t.academic_year_id, year: t.academic_years?.year || '' } : null,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/teams/:id */
router.get('/:id', async (req, res) => {
  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*, units(name, code), academic_years(year)')
      .eq('id', req.params.id)
      .single();

    if (error || !team) return res.status(404).json({ success: false, message: 'Team not found.' });

    const formatted = {
      ...team,
      _id: team.id,
      unitId: team.unit_id ? { _id: team.unit_id, id: team.unit_id, name: team.units?.name || '', code: team.units?.code || '' } : null,
      academicYearId: team.academic_year_id ? { _id: team.academic_year_id, id: team.academic_year_id, year: team.academic_years?.year || '' } : null,
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** GET /api/teams/:id/members */
router.get('/:id/members', async (req, res) => {
  try {
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', req.params.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    const formatted = (members || []).map(m => ({
      ...m,
      _id: m.id,
      teamId: m.team_id,
      batchYear: m.batch_year,
      socialLinks: m.social_links || {},
      isActive: m.is_active,
      displayOrder: m.display_order,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/teams */
router.post('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { name, unitId, academicYearId, status } = req.body;
    if (!unitId || !academicYearId) return res.status(400).json({ success: false, message: 'unitId and academicYearId are required.' });

    if (!canAccessUnit(req.admin, unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const { data: team, error } = await supabase
      .from('teams')
      .insert([{
        name: name || 'Executive Board',
        unit_id: unitId,
        academic_year_id: academicYearId,
        status: status || 'Active',
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Create Team', 'Team', team.id, unitId);
    res.status(201).json({ success: true, data: { ...team, _id: team.id }, message: 'Team created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/teams/:id */
router.put('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: team } = await supabase.from('teams').select('*').eq('id', req.params.id).single();
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const updates = { updated_at: new Date().toISOString() };
    if (req.body.name) updates.name = req.body.name;
    if (req.body.status) updates.status = req.body.status;

    const { data: updated, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Edit Team', 'Team', updated.id, team.unit_id);
    res.json({ success: true, data: { ...updated, _id: updated.id }, message: 'Team updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/teams/:id/members */
router.post('/:id/members', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: team } = await supabase.from('teams').select('*').eq('id', req.params.id).single();
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const { name, position, biography, department, batchYear, socialLinks, displayOrder, isActive } = req.body;
    if (!name || !position) return res.status(400).json({ success: false, message: 'Name and position are required.' });

    const { data: member, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        name,
        position,
        biography: biography || '',
        department: department || '',
        batch_year: batchYear || '',
        social_links: socialLinks || {},
        display_order: displayOrder ?? 0,
        is_active: isActive !== undefined ? isActive : true,
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Create Team Member', 'TeamMember', member.id, team.unit_id);
    res.status(201).json({ success: true, data: { ...member, _id: member.id, teamId: member.team_id }, message: 'Team member added.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/teams/members/:memberId */
router.delete('/members/:memberId', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: member } = await supabase.from('team_members').select('*').eq('id', req.params.memberId).single();
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    const { data: team } = await supabase.from('teams').select('*').eq('id', member.team_id).single();
    if (team && !canAccessUnit(req.admin, team.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    await supabase.from('team_members').delete().eq('id', member.id);
    if (team) await logAction(req, 'Delete Team Member', 'TeamMember', member.id, team.unit_id);

    res.json({ success: true, message: 'Member deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
