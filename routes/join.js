/**
 * routes/join.js
 * API router for volunteer join requests & application management.
 * Updated for multi-unit platform with unit-level authorization.
 */

const express     = require('express');
const router      = express.Router();
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');
const JoinRequest = require('../database/models/JoinRequest');
const Notification = require('../database/models/Notification');
const AdminUser   = require('../database/models/AdminUser');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');

// Temp upload for files (moved to Nextcloud after validation)
const tmpDir = path.join(__dirname, '..', 'uploads', 'tmp');
const storage = multer.diskStorage({
  destination: (req, file, cb) => { fs.mkdirSync(tmpDir, { recursive: true }); cb(null, tmpDir); },
  filename:    (req, file, cb) => { cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`); },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Safe parse helper
const parseArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { const p = JSON.parse(val); if (Array.isArray(p)) return p; } catch {}
  return typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
};

/**
 * POST /api/join
 * Submit multi-step volunteer application.
 */
router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'profileImage', maxCount: 1 }]), async (req, res) => {
  const tmpFiles = [];
  if (req.files?.resume?.[0])       tmpFiles.push(req.files.resume[0].path);
  if (req.files?.profileImage?.[0]) tmpFiles.push(req.files.profileImage[0].path);

  try {
    const { name, email, phone, gender, dob, college, department, year, city, unitId, academicYearId, skills, interests, previousExperience, reason } = req.body;
    if (!name || !email || !phone || !college || !department || !year || !city || !reason) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    // TODO: When Nextcloud is active, upload resume and profileImage to Nextcloud using webdav.uploadFile
    // For now, store the tmp filename as placeholder
    const resumePath      = req.files?.resume?.[0] ? req.files.resume[0].filename : null;
    const profileImagePath = req.files?.profileImage?.[0] ? req.files.profileImage[0].filename : null;

    const application = await JoinRequest.create({
      name, email, phone, gender: gender || 'Male', dob: dob || null,
      college, department, year, city,
      unitId: unitId || null,
      academicYearId: academicYearId || null,
      skills:    parseArray(skills),
      interests: parseArray(interests),
      previousExperience: previousExperience || '',
      reason, resumePath, profileImagePath, status: 'Pending',
    });

    // Create notifications for admins assigned to this unit
    const io = req.app.get('io');
    const notifData = {
      title:      'New Volunteer Application',
      message:    `${name} from ${college} submitted an application.`,
      type:       'join_request',
      entityType: 'JoinRequest',
      entityId:   application._id.toString(),
      unitId:     unitId || null,
      linkUrl:    '/admin',
    };

    if (unitId) {
      // Notify admins assigned to this unit
      const unitAdmins = await AdminUser.find({ assignedUnitIds: unitId, status: 'Active' });
      for (const a of unitAdmins) {
        const notif = await Notification.create({ ...notifData, recipientAdminId: a._id });
        if (io) io.to(`admin-${a._id}`).emit('new_notification', notif);
      }
      // Also notify main admin
      const mainAdmin = await AdminUser.findOne({ role: 'MAIN_ADMIN' });
      if (mainAdmin) {
        const notif = await Notification.create({ ...notifData, recipientAdminId: mainAdmin._id });
        if (io) io.to('main-admin').emit('new_notification', notif);
      }
    } else {
      // No unit selected — notify main admin only
      const mainAdmin = await AdminUser.findOne({ role: 'MAIN_ADMIN' });
      if (mainAdmin) {
        const notif = await Notification.create({ ...notifData, recipientAdminId: mainAdmin._id });
        if (io) io.to('main-admin').emit('new_notification', notif);
      }
    }

    res.status(201).json({ success: true, message: 'Application submitted! Our team will review it soon.', data: application });
  } catch (err) {
    console.error('[JOIN ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  } finally {
    // Clean up tmp files (in production these would have been moved to Nextcloud already)
    tmpFiles.forEach(f => { if (f && fs.existsSync(f)) fs.unlinkSync(f); });
  }
});

/**
 * GET /api/join  — Admin: list applications, scoped by unit
 */
router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.unitId) filter.unitId = req.query.unitId;

    // Sub-Admins scoped to their units
    if (req.admin.role === 'SUB_ADMIN') {
      filter.unitId = { $in: req.admin.assignedUnitIds };
    }

    if (req.query.search) {
      filter.$or = [
        { name:       new RegExp(req.query.search, 'i') },
        { email:      new RegExp(req.query.search, 'i') },
        { college:    new RegExp(req.query.search, 'i') },
        { department: new RegExp(req.query.search, 'i') },
      ];
    }

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      JoinRequest.find(filter).populate('unitId', 'name code').sort({ createdAt: -1 }).skip(skip).limit(limit),
      JoinRequest.countDocuments(filter),
    ]);

    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/join/:id — Admin: get single application
 */
router.get('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const req_ = await JoinRequest.findById(req.params.id).populate('unitId', 'name code').populate('academicYearId', 'year');
    if (!req_) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (req_.unitId && !canAccessUnit(req.admin, req_.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });
    res.json({ success: true, data: req_ });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/**
 * PATCH /api/join/:id/status — Admin: Approve or Reject
 */
router.patch('/:id/status', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const application = await JoinRequest.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    if (application.unitId && !canAccessUnit(req.admin, application.unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    application.status    = status;
    if (adminNotes !== undefined) application.adminNotes = adminNotes;
    await application.save();

    res.json({ success: true, message: `Application ${status.toLowerCase()}.`, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Legacy PUT alias for backward compatibility
router.put('/:id/status', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  req.method = 'PATCH';
  router.handle(req, res, () => {});
});

module.exports = router;
