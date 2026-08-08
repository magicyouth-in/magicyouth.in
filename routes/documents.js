/**
 * routes/documents.js
 * Documentation CRUD. Files stored via Nextcloud/WebDAV, metadata in MongoDB.
 * Public: read + download public docs. Admin: upload/delete with unit auth.
 */

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Document = require('../database/models/Document');
const AcademicYear = require('../database/models/AcademicYear');
const Unit     = require('../database/models/Unit');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');
const webdav   = require('../utils/webdav');

const ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'text/plain',
];

const tmpDir  = path.join(__dirname, '..', 'uploads', 'tmp');
const storage = multer.diskStorage({
  destination: (req, file, cb) => { fs.mkdirSync(tmpDir, { recursive: true }); cb(null, tmpDir); },
  filename:    (req, file, cb) => { cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`); },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`File type "${file.mimetype}" is not allowed.`));
  },
});

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// Helper to check authentication from token cookie
const jwt = require('jsonwebtoken');
const AdminUser = require('../database/models/AdminUser');
const JWT_SECRET = process.env.JWT_SECRET || 'MagicYouth_JWT_FallbackSecret';

async function getAuthAdmin(req) {
  const token = req.cookies?.magicyouth_token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await AdminUser.findById(decoded.adminId);
    return admin && admin.status === 'Active' ? admin : null;
  } catch {
    return null;
  }
}

// ─── PROTECTED DOCUMENTATION ACCESS ──────────────────────────────────────────

/** GET /api/documents?unitId=&academicYearId=&eventId=&documentType=&search= */
router.get('/', async (req, res) => {
  try {
    const authAdmin = await getAuthAdmin(req);
    if (!authAdmin) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Documentation section is restricted to authorized Unit Leads and Administrators. Please sign in with your Lead ID and Password.'
      });
    }

    const filter = {};
    if (authAdmin.role !== 'MAIN_ADMIN') {
      filter.visibility = { $ne: 'Admin Only' };
      if (authAdmin.assignedUnitIds?.length > 0) {
        filter.unitId = { $in: authAdmin.assignedUnitIds };
      }
    }

    if (req.query.unitId)         filter.unitId         = req.query.unitId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
    if (req.query.eventId)        filter.eventId        = req.query.eventId;
    if (req.query.documentType)   filter.documentType   = req.query.documentType;
    if (req.query.search)         filter.title = { $regex: new RegExp(req.query.search, 'i') };

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Document.find(filter)
        .populate('unitId', 'name code')
        .populate('academicYearId', 'year')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      Document.countDocuments(filter),
    ]);

    res.json({ success: true, authenticated: true, admin: { name: authAdmin.name, email: authAdmin.email, role: authAdmin.role }, data: docs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/documents/download/:id — Secure download */
router.get('/download/:id', async (req, res) => {
  try {
    const authAdmin = await getAuthAdmin(req);
    if (!authAdmin) {
      return res.status(401).json({ success: false, message: 'Authentication required to download documentation.' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

    if (authAdmin.role !== 'MAIN_ADMIN') {
      if (doc.visibility === 'Admin Only') return res.status(403).json({ success: false, message: 'Access denied.' });
      if (authAdmin.assignedUnitIds?.length > 0 && !authAdmin.assignedUnitIds.map(id => id.toString()).includes(doc.unitId.toString())) {
        return res.status(403).json({ success: false, message: 'Forbidden. No access to this Unit documentation.' });
      }
    }

    const buffer = await webdav.downloadFile(doc.filePath);
    res.set('Content-Type', doc.mimeType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.title)}${path.extname(doc.filePath)}"`);
    doc.downloadsCount = (doc.downloadsCount || 0) + 1;
    doc.save().catch(() => {});
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not retrieve file.' });
  }
});

/** GET /api/documents/:id */
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('unitId', 'name code')
      .populate('academicYearId', 'year')
      .populate('eventId', 'title');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (doc.visibility === 'Admin Only') return res.status(403).json({ success: false, message: 'Access denied.' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/** GET /api/documents/admin/all — Admin full list */
router.get('/admin/all', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.unitId)         filter.unitId         = req.query.unitId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
    if (req.query.documentType)   filter.documentType   = req.query.documentType;
    if (req.query.search)         filter.title = { $regex: new RegExp(req.query.search, 'i') };

    // Sub-Admins can only see their units
    if (req.admin.role === 'SUB_ADMIN') {
      filter.unitId = { $in: req.admin.assignedUnitIds };
    }

    const docs = await Document.find(filter)
      .populate('unitId', 'name code')
      .populate('academicYearId', 'year')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/documents — Upload */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.single('file'), async (req, res) => {
  const tmpFile = req.file ? req.file.path : null;
  try {
    if (!tmpFile) return res.status(400).json({ success: false, message: 'File is required.' });

    const { title, description, unitId, academicYearId, eventId, documentType, visibility } = req.body;
    if (!title || !unitId || !academicYearId) return res.status(400).json({ success: false, message: 'title, unitId, and academicYearId are required.' });

    if (!canAccessUnit(req.admin, unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const [unit, ay] = await Promise.all([Unit.findById(unitId), AcademicYear.findById(academicYearId)]);
    const filename   = `${Date.now()}-${path.basename(tmpFile)}`;
    const remotePath = webdav.buildPath({ unitCode: unit.code, year: ay.year, area: 'Documentation', filename });
    const filePath   = await webdav.uploadFile(tmpFile, remotePath);

    const doc = await Document.create({
      title, description: description || '',
      unitId, academicYearId,
      eventId: eventId || null,
      documentType: documentType || 'Other Documents',
      filePath,
      fileSize:  req.file.size,
      mimeType:  req.file.mimetype,
      visibility: visibility || 'Public',
    });

    await logAction(req, 'Upload Document', 'Document', doc._id.toString(), unitId);
    res.status(201).json({ success: true, data: doc, message: 'Document uploaded.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

/** DELETE /api/documents/:id */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (!canAccessUnit(req.admin, doc.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    try { await webdav.deleteFile(doc.filePath); } catch {}
    await Document.findByIdAndDelete(doc._id);
    await logAction(req, 'Delete Document', 'Document', doc._id.toString(), doc.unitId);
    res.json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/documents/:id/visibility */
router.patch('/:id/visibility', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (!canAccessUnit(req.admin, doc.unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    doc.visibility = req.body.visibility === 'Admin Only' ? 'Admin Only' : 'Public';
    await doc.save();
    res.json({ success: true, data: doc, message: 'Visibility updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
