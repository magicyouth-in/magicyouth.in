/**
 * routes/teams.js
 * CRUD for Teams and Team Members.
 * Public: GET teams + members for Teams page.
 * Admin: full CRUD with unit authorization.
 */

const express     = require('express');
const router      = express.Router();
const Team        = require('../database/models/Team');
const TeamMember  = require('../database/models/TeamMember');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/** GET /api/teams?unitId=&academicYearId= */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.unitId)         filter.unitId         = req.query.unitId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;

    const teams = await Team.find(filter)
      .populate('unitId', 'name code')
      .populate('academicYearId', 'year')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/teams/:id */
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('unitId', 'name code')
      .populate('academicYearId', 'year');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** GET /api/teams/:id/members */
router.get('/:id/members', async (req, res) => {
  try {
    const members = await TeamMember.find({ teamId: req.params.id, isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/** POST /api/teams */
router.post('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { name, unitId, academicYearId, status } = req.body;
    if (!unitId || !academicYearId) return res.status(400).json({ success: false, message: 'unitId and academicYearId are required.' });

    if (!canAccessUnit(req.admin, unitId)) return res.status(403).json({ success: false, message: 'Forbidden. No access to this Unit.' });

    const team = await Team.create({ name: name || 'Executive Board', unitId, academicYearId, status: status || 'Active' });
    await logAction(req, 'Create Team', 'Team', team._id.toString(), unitId);
    res.status(201).json({ success: true, data: team, message: 'Team created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/teams/:id */
router.put('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (!canAccessUnit(req.admin, team.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    if (req.body.name)   team.name   = req.body.name;
    if (req.body.status) team.status = req.body.status;
    await team.save();
    await logAction(req, 'Edit Team', 'Team', team._id.toString(), team.unitId);
    res.json({ success: true, data: team, message: 'Team updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/teams/:id/archive — Archive (Any admin with access) */
router.patch('/:id/archive', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });
    team.status = 'Archived';
    await team.save();
    await logAction(req, 'Archive Team', 'Team', team._id.toString(), team.unitId);
    res.json({ success: true, message: 'Team archived.', data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/teams/:id/unarchive — Unarchive (Any admin with access) */
router.patch('/:id/unarchive', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });
    team.status = 'Active';
    await team.save();
    await logAction(req, 'Unarchive Team', 'Team', team._id.toString(), team.unitId);
    res.json({ success: true, message: 'Team unarchived.', data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────

/** POST /api/teams/:id/members */
router.post('/:id/members', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const { name, position, biography, department, batchYear, socialLinks, displayOrder, isActive } = req.body;
    if (!name || !position) return res.status(400).json({ success: false, message: 'Name and position are required.' });

    const member = await TeamMember.create({
      name, position, teamId: team._id,
      biography: biography || '',
      department: department || '',
      batchYear: batchYear || '',
      socialLinks: socialLinks || {},
      displayOrder: displayOrder ?? 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    await logAction(req, 'Create Team Member', 'TeamMember', member._id.toString(), team.unitId);
    res.status(201).json({ success: true, data: member, message: 'Team member added.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/teams/members/:memberId */
router.put('/members/:memberId', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    const team = await Team.findById(member.teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const fields = ['name', 'position', 'biography', 'department', 'batchYear', 'socialLinks', 'displayOrder', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) member[f] = req.body[f]; });
    await member.save();
    await logAction(req, 'Edit Team Member', 'TeamMember', member._id.toString(), team.unitId);
    res.json({ success: true, data: member, message: 'Member updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/teams/members/:memberId */
router.delete('/members/:memberId', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    const team = await Team.findById(member.teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    await TeamMember.findByIdAndDelete(member._id);
    await logAction(req, 'Delete Team Member', 'TeamMember', member._id.toString(), team.unitId);
    res.json({ success: true, message: 'Member deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
