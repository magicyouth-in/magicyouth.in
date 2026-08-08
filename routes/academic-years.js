/**
 * routes/academic-years.js
 * CRUD for Academic Years linked to Units.
 * Manage: Main Admin only. Read: any authenticated admin + public.
 */

const express       = require('express');
const router        = express.Router();
const AcademicYear  = require('../database/models/AcademicYear');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/** GET /api/academic-years?unitId= */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.unitId) filter.unitId = req.query.unitId;
    if (req.query.status) filter.status = req.query.status;
    const years = await AcademicYear.find(filter).populate('unitId', 'name code').sort({ year: -1 });
    res.json({ success: true, data: years });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/academic-years/:id */
router.get('/:id', async (req, res) => {
  try {
    const year = await AcademicYear.findById(req.params.id).populate('unitId', 'name code');
    if (!year) return res.status(404).json({ success: false, message: 'Academic year not found.' });
    res.json({ success: true, data: year });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/** POST /api/academic-years */
router.post('/', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { unitId, year, status } = req.body;
    if (!unitId || !year) return res.status(400).json({ success: false, message: 'unitId and year are required.' });

    const ay = await AcademicYear.create({ unitId, year, status: status || 'Active' });
    await logAction(req, 'Create Academic Year', 'AcademicYear', ay._id.toString(), unitId);
    res.status(201).json({ success: true, data: ay, message: 'Academic year created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/academic-years/:id */
router.put('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const ay = await AcademicYear.findById(req.params.id);
    if (!ay) return res.status(404).json({ success: false, message: 'Academic year not found.' });

    if (req.body.year)   ay.year   = req.body.year;
    if (req.body.status) ay.status = req.body.status;
    await ay.save();
    await logAction(req, 'Edit Academic Year', 'AcademicYear', ay._id.toString(), ay.unitId);
    res.json({ success: true, data: ay, message: 'Academic year updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
