/**
 * routes/team.js
 * CRUD API for Team Members management.
 * Rewritten to use MongoDB / Mongoose.
 */

const express = require('express');
const router = express.Router();
const TeamMember = require('../database/models/TeamMember');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'team');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only image files are allowed for profile photos.'));
  },
});

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * GET /api/team
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.year)       filter.teamYear  = req.query.year;
    if (req.query.current === '1') filter.isCurrent = true;

    const members = await TeamMember.find(filter).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/team/years  — MUST be before /:id
 */
router.get('/years', async (req, res) => {
  try {
    const years = await TeamMember.distinct('teamYear', { teamYear: { $ne: null } });
    res.json({ success: true, data: years.sort().reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/team/current  — MUST be before /:id
 */
router.get('/current', async (req, res) => {
  try {
    const members = await TeamMember.find({ isCurrent: true }).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/team/:id  — MUST be after named sub-routes
 */
router.get('/:id', async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' });
    res.json({ success: true, data: member });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid team member ID.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * POST /api/team
 */
router.post('/', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { name, position, department, batch_year, contact, social_links, team_year, is_current, display_order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });

    let socialLinks = {};
    if (social_links) {
      try { socialLinks = typeof social_links === 'string' ? JSON.parse(social_links) : social_links; } catch { /* ignore */ }
    }

    const member = await TeamMember.create({
      name,
      position:     position     || null,
      photo:        req.file ? req.file.filename : null,
      department:   department   || null,
      batchYear:    batch_year   || null,
      contact:      contact      || null,
      socialLinks,
      teamYear:     team_year    || null,
      isCurrent:    is_current !== '0',
      displayOrder: parseInt(display_order) || 0,
    });

    res.status(201).json({ success: true, data: member, message: 'Team member added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/team/:id
 */
router.put('/:id', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' });

    const { name, position, department, batch_year, contact, social_links, team_year, is_current, display_order } = req.body;

    if (req.file) {
      if (member.photo) {
        const old = path.join(__dirname, '..', 'uploads', 'team', member.photo);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      member.photo = req.file.filename;
    }

    if (name)                    member.name         = name;
    if (position !== undefined)  member.position     = position;
    if (department !== undefined) member.department  = department;
    if (batch_year !== undefined) member.batchYear   = batch_year;
    if (contact !== undefined)   member.contact      = contact;
    if (team_year !== undefined)  member.teamYear    = team_year;
    if (is_current !== undefined) member.isCurrent   = is_current === '1' || is_current === true;
    if (display_order !== undefined) member.displayOrder = parseInt(display_order);
    if (social_links !== undefined) {
      try { member.socialLinks = typeof social_links === 'string' ? JSON.parse(social_links) : social_links; } catch { /* ignore */ }
    }

    await member.save();
    res.json({ success: true, data: member, message: 'Team member updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/team/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' });

    if (member.photo) {
      const p = path.join(__dirname, '..', 'uploads', 'team', member.photo);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    res.json({ success: true, message: 'Team member deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
