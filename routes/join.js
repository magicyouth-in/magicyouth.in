/**
 * routes/join.js
 * API router for volunteer join requests & application management.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JoinRequest = require('../database/models/JoinRequest');
const Notification = require('../database/models/Notification');
const { requireAuth } = require('../middleware/auth');

// Multer storage for application documents/photos
const uploadDir = path.join(__dirname, '..', 'uploads', 'join');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `join_${Date.now()}_${Math.round(Math.random()*1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * POST /api/join
 * Submit multi-step volunteer application.
 */
router.post('/', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name, email, phone, gender, dob, college, department,
      year, city, skills, interests, previousExperience, reason
    } = req.body;

    if (!name || !email || !phone || !college || !department || !year || !city || !reason) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    // Safe parse helper for array inputs
    const parseArray = (val) => {
      if (Array.isArray(val)) return val;
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
      }
      return [];
    };

    const parsedSkills = parseArray(skills);
    const parsedInterests = parseArray(interests);

    let resumeUrl = null;
    let profileImage = null;

    if (req.files?.resume?.[0]) {
      resumeUrl = req.files.resume[0].filename;
    }
    if (req.files?.profileImage?.[0]) {
      profileImage = req.files.profileImage[0].filename;
    }

    const application = new JoinRequest({
      name, email, phone, gender, dob, college, department,
      year, city, skills: parsedSkills, interests: parsedInterests,
      previousExperience, reason, resumeUrl, profileImage, status: 'Pending'
    });

    await application.save();

    // Create system notification
    const notification = new Notification({
      title: 'New Volunteer Application',
      message: `${name} from ${college} submitted a volunteer application.`,
      type: 'join_request',
      linkUrl: '/admin/join-requests',
      isRead: false
    });
    await notification.save();

    // Emit Socket.IO real-time alert to admins
    const io = req.app.get('io');
    if (io) {
      io.emit('new_notification', notification);
      io.emit('new_join_request', application);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our team will review your application soon.',
      data: application
    });

  } catch (err) {
    console.error('Join Application Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
});

/**
 * GET /api/join (Admin)
 * List all volunteer applications with status filter.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
        { college: new RegExp(req.query.search, 'i') },
        { department: new RegExp(req.query.search, 'i') }
      ];
    }

    const applications = await JoinRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/join/:id/status (Admin)
 * Approve or reject application.
 */
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const application = await JoinRequest.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = status;
    if (adminNotes !== undefined) application.adminNotes = adminNotes;

    await application.save();

    res.json({ success: true, message: `Application status updated to ${status}.`, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
