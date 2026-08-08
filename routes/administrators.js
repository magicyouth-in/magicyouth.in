/**
 * routes/administrators.js
 * Sub-Admin management. Only Main Admin can access these routes.
 */

const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const AdminUser = require('../database/models/AdminUser');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// All routes require Main Admin
router.use(authenticateAdmin, requireMainAdmin);

/** GET /api/administrators — List all Sub-Admins */
router.get('/', async (req, res) => {
  try {
    const admins = await AdminUser.find({ role: 'SUB_ADMIN' })
      .populate('assignedUnitIds', 'name code')
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/administrators/:id */
router.get('/:id', async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.params.id)
      .populate('assignedUnitIds', 'name code')
      .select('-passwordHash');
    if (!admin || admin.role === 'MAIN_ADMIN') return res.status(404).json({ success: false, message: 'Sub-admin not found.' });
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** POST /api/administrators — Create Sub-Admin */
router.post('/', async (req, res) => {
  try {
    const { name, email, password, assignedUnitIds, status } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    if (password.length < 8)          return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ success: false, message: 'An account with that email already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const subAdmin = await AdminUser.create({
      name, email: email.toLowerCase().trim(),
      passwordHash, role: 'SUB_ADMIN',
      assignedUnitIds: assignedUnitIds || [],
      status: status || 'Active',
    });

    await logAction(req, 'Create Sub-Admin', 'AdminUser', subAdmin._id.toString(), null);

    const result = subAdmin.toObject();
    delete result.passwordHash;
    res.status(201).json({ success: true, data: result, message: 'Sub-Admin created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/administrators/:id — Edit Sub-Admin */
router.put('/:id', async (req, res) => {
  try {
    const subAdmin = await AdminUser.findById(req.params.id);
    if (!subAdmin || subAdmin.role === 'MAIN_ADMIN') return res.status(404).json({ success: false, message: 'Sub-admin not found.' });

    const { name, email, assignedUnitIds, status } = req.body;
    if (name)             subAdmin.name             = name;
    if (email)            subAdmin.email            = email.toLowerCase().trim();
    if (assignedUnitIds !== undefined) subAdmin.assignedUnitIds = assignedUnitIds;
    if (status)           subAdmin.status           = status;

    await subAdmin.save();
    await logAction(req, 'Edit Sub-Admin', 'AdminUser', subAdmin._id.toString(), null);
    const result = subAdmin.toObject();
    delete result.passwordHash;
    res.json({ success: true, data: result, message: 'Sub-Admin updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/administrators/:id/status — Enable or Disable */
router.patch('/:id/status', async (req, res) => {
  try {
    const subAdmin = await AdminUser.findById(req.params.id);
    if (!subAdmin || subAdmin.role === 'MAIN_ADMIN') return res.status(404).json({ success: false, message: 'Sub-admin not found.' });

    subAdmin.status = req.body.status === 'Active' ? 'Active' : 'Inactive';
    await subAdmin.save();
    const action = subAdmin.status === 'Active' ? 'Enable Sub-Admin' : 'Disable Sub-Admin';
    await logAction(req, action, 'AdminUser', subAdmin._id.toString(), null);
    res.json({ success: true, message: `Sub-Admin ${subAdmin.status === 'Active' ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/administrators/:id/reset-password */
router.patch('/:id/reset-password', async (req, res) => {
  try {
    const subAdmin = await AdminUser.findById(req.params.id);
    if (!subAdmin || subAdmin.role === 'MAIN_ADMIN') return res.status(404).json({ success: false, message: 'Sub-admin not found.' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });

    subAdmin.passwordHash = await bcrypt.hash(newPassword, 12);
    await subAdmin.save();
    await logAction(req, 'Reset Sub-Admin Password', 'AdminUser', subAdmin._id.toString(), null);
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/administrators/:id */
router.delete('/:id', async (req, res) => {
  try {
    const subAdmin = await AdminUser.findById(req.params.id);
    if (!subAdmin || subAdmin.role === 'MAIN_ADMIN') return res.status(404).json({ success: false, message: 'Sub-admin not found.' });

    await AdminUser.findByIdAndDelete(subAdmin._id);
    await logAction(req, 'Delete Sub-Admin', 'AdminUser', subAdmin._id.toString(), null);
    res.json({ success: true, message: 'Sub-Admin deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
