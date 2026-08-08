/**
 * routes/units.js
 * CRUD for MAGIC Youth Units.
 * Create/Edit/Archive: Main Admin only.
 * Read: any authenticated admin (returns only assigned units for Sub-Admins).
 * Public GET: returns active units for public pages (no auth required).
 */

const express  = require('express');
const router   = express.Router();
const Unit     = require('../database/models/Unit');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/** GET /api/units — Public list (Active only) */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.includeInactive !== 'true') filter.status = 'Active';
    const units = await Unit.find(filter).sort({ name: 1 });
    res.json({ success: true, data: units });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/units/:id — Public detail */
router.get('/:id', async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found.' });
    res.json({ success: true, data: unit });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid unit ID.' });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/** POST /api/units — Create (Main Admin only) */
router.post('/', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, code, institution, location, description, status } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required.' });

    const unit = await Unit.create({ name, code, institution, location, description, status: status || 'Active' });
    await logAction(req, 'Create Unit', 'Unit', unit._id.toString(), null);
    res.status(201).json({ success: true, data: unit, message: 'Unit created.' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'A unit with that code already exists.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/units/:id — Edit (Main Admin only) */
router.put('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    const { name, code, institution, location, description, status } = req.body;
    if (name)        unit.name        = name;
    if (code)        unit.code        = code;
    if (institution !== undefined) unit.institution = institution;
    if (location    !== undefined) unit.location    = location;
    if (description !== undefined) unit.description = description;
    if (status)      unit.status      = status;

    await unit.save();
    await logAction(req, 'Edit Unit', 'Unit', unit._id.toString(), unit._id);
    res.json({ success: true, data: unit, message: 'Unit updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/units/:id/archive — Archive (Main Admin only) */
router.patch('/:id/archive', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, { status: 'Archived' }, { new: true });
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found.' });
    await logAction(req, 'Archive Unit', 'Unit', unit._id.toString(), unit._id);
    res.json({ success: true, message: 'Unit archived.', data: unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/units/:id/unarchive — Unarchive (Main Admin only) */
router.patch('/:id/unarchive', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, { status: 'Active' }, { new: true });
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found.' });
    await logAction(req, 'Unarchive Unit', 'Unit', unit._id.toString(), unit._id);
    res.json({ success: true, message: 'Unit unarchived.', data: unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
