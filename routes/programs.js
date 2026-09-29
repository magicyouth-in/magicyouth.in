/**
 * routes/programs.js
 * Dedicated API router for MAGIC Youth Recurring / Flagship Programs.
 * Uses MongoDB Atlas (programs collection) as the permanent source of truth
 * and Supabase Storage for permanent posters and images.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Program = require('../database/models/Program');
const { connectDB } = require('../database/mongoose');
const supabase = require('../utils/supabaseClient');
const { BUCKETS, uploadFile, deleteFile } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// Ensure MongoDB Atlas connection for all program requests
router.use(async (req, res, next) => {
  try {
    const conn = await connectDB();
    if (!conn) {
      return res.status(503).json({ success: false, message: 'Database service unavailable. Please check MongoDB Atlas connection.' });
    }
    next();
  } catch (err) {
    console.error('[MongoDB Program Route Error]', err.message);
    return res.status(503).json({ success: false, message: `Database connection failure: ${err.message}` });
  }
});

// Multer storage for program images
const tmpDir = os.tmpdir();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prog-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpeg|jpg|png|webp|gif|heic|heif)$/i;
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'
  ];
  if (allowedExts.test(path.extname(file.originalname)) || allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPEG, JPG, PNG, WEBP, GIF, HEIC) are allowed.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter,
});

async function processProgramImage(file) {
  if (!file) return null;
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const destName = `programs/${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

  try {
    const targetBucket = BUCKETS.EVENTS || BUCKETS.GALLERY || 'events';
    const { publicUrl } = await uploadFile(targetBucket, filePath, destName, file.mimetype);
    if (publicUrl) return publicUrl;
  } catch (supaErr) {
    console.warn('[Supabase Program Image Upload Note]', supaErr.message);
  }

  try {
    const publicUploadDir = path.join(__dirname, '..', 'uploads', 'programs');
    if (!fs.existsSync(publicUploadDir)) {
      fs.mkdirSync(publicUploadDir, { recursive: true });
    }
    const publicFileName = `${Date.now()}-${path.basename(filePath)}`;
    const targetPath = path.join(publicUploadDir, publicFileName);
    fs.copyFileSync(filePath, targetPath);
    return `/uploads/programs/${publicFileName}`;
  } catch {}

  try {
    const buffer = fs.readFileSync(filePath);
    return `data:${file.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

// Helper to populate unit and academic year objects
async function populateProgramRelations(prog) {
  let unitObj = null;
  let yearObj = null;

  if (prog.unitId || prog.unit_id) {
    const uId = prog.unitId || prog.unit_id;
    try {
      const { data: u } = await supabase.from('units').select('id, name, code').eq('id', uId).single();
      if (u) unitObj = { _id: u.id, id: u.id, name: u.name, code: u.code };
    } catch {}
  }

  if (prog.academicYearId || prog.academic_year_id) {
    const yId = prog.academicYearId || prog.academic_year_id;
    try {
      const { data: y } = await supabase.from('academic_years').select('id, year').eq('id', yId).single();
      if (y) yearObj = { _id: y.id, id: y.id, year: y.year };
    } catch {}
  }

  return {
    ...prog,
    _id: prog._id || prog.id,
    id: prog._id || prog.id,
    unitId: unitObj || (prog.unitId ? { _id: prog.unitId, id: prog.unitId, name: 'Campus Unit' } : null),
    academicYearId: yearObj || (prog.academicYearId ? { _id: prog.academicYearId, id: prog.academicYearId, year: '2025-26' } : null),
  };
}

/**
 * GET /api/programs
 * Fetch all programs from MongoDB Atlas with optional unit, academicYear, status, or search filters.
 */
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { unitId, academicYearId, status, search, all } = req.query;

    const filter = {};
    if (unitId && unitId !== 'All') filter.unitId = unitId;
    if (academicYearId && academicYearId !== 'All') filter.academicYearId = academicYearId;
    if (status && status !== 'All') filter.status = status;

    let query = Program.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    if (search) {
      query = Program.find({
        ...filter,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ]
      }).sort({ displayOrder: 1, createdAt: -1 });
    }

    const mongoList = await query.exec();
    const list = (mongoList || []).map(p => p.toObject ? p.toObject() : p);
    const populated = await Promise.all(list.map(populateProgramRelations));
    res.json({ success: true, data: populated });
  } catch (err) {
    console.error('[GET /api/programs Error]', err.message);
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

/**
 * GET /api/programs/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const prog = await Program.findById(req.params.id);
    if (!prog) return res.status(404).json({ success: false, message: 'Program not found.' });

    const populated = await populateProgramRelations(prog.toObject());
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/programs
 * Create a new program in MongoDB Atlas.
 */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const { title, shortDescription, description, category, status, unitId, academicYearId, startDate, endDate, displayOrder } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    if (unitId && !canAccessUnit(req.admin, unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    let posterUrl = req.body.poster || null;
    if (req.file) {
      posterUrl = await processProgramImage(req.file);
    }

    const newProg = {
      title: title.trim(),
      shortDescription: shortDescription ? shortDescription.trim() : '',
      description: description.trim(),
      category: category ? category.trim() : 'Flagship Initiative',
      status: status || 'Ongoing',
      unitId: unitId || null,
      academicYearId: academicYearId || null,
      startDate: startDate || null,
      endDate: endDate || null,
      poster: posterUrl,
      displayOrder: parseInt(displayOrder) || 0,
    };

    const created = await Program.create(newProg);
    const saved = created.toObject();

    await logAction(req, 'Create Program', 'Program', saved._id, unitId);
    const populated = await populateProgramRelations(saved);
    res.status(201).json({ success: true, data: populated, message: 'Program created successfully.' });
  } catch (err) {
    console.error('[POST /api/programs Error]', err.message);
    res.status(500).json({ success: false, message: `Failed to save program: ${err.message}` });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * PUT /api/programs/:id
 * Update an existing program in MongoDB Atlas.
 */
router.put('/:id', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const existing = await Program.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Program not found.' });

    const currentUnitId = existing.unitId || existing.unit_id;
    if (currentUnitId && !canAccessUnit(req.admin, currentUnitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    let posterUrl = existing.poster;
    if (req.body.removePoster === 'true' || req.body.removePoster === true) {
      posterUrl = null;
    }
    if (req.file) {
      posterUrl = await processProgramImage(req.file);
    }

    const updates = {
      title: req.body.title !== undefined ? req.body.title.trim() : existing.title,
      shortDescription: req.body.shortDescription !== undefined ? req.body.shortDescription.trim() : (existing.shortDescription || ''),
      description: req.body.description !== undefined ? req.body.description.trim() : existing.description,
      category: req.body.category !== undefined ? req.body.category.trim() : existing.category,
      status: req.body.status !== undefined ? req.body.status : existing.status,
      unitId: req.body.unitId !== undefined ? req.body.unitId : existing.unitId,
      academicYearId: req.body.academicYearId !== undefined ? req.body.academicYearId : existing.academicYearId,
      startDate: req.body.startDate !== undefined ? req.body.startDate : existing.startDate,
      endDate: req.body.endDate !== undefined ? req.body.endDate : existing.endDate,
      displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder) : existing.displayOrder,
      poster: posterUrl,
      updatedAt: new Date().toISOString(),
    };

    const updated = await Program.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Program not found.' });

    await logAction(req, 'Edit Program', 'Program', req.params.id, updates.unitId);
    const populated = await populateProgramRelations(updated.toObject());
    res.json({ success: true, data: populated, message: 'Program updated successfully.' });
  } catch (err) {
    console.error(`[PUT /api/programs/${req.params.id} Error]`, err.message);
    res.status(500).json({ success: false, message: `Failed to update program: ${err.message}` });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * DELETE /api/programs/:id
 */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const existing = await Program.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Program not found.' });

    const currentUnitId = existing.unitId || existing.unit_id;
    if (currentUnitId && !canAccessUnit(req.admin, currentUnitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await Program.findByIdAndDelete(req.params.id);

    await logAction(req, 'Delete Program', 'Program', req.params.id);
    res.json({ success: true, message: 'Program deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
