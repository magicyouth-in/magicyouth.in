/**
 * routes/impact.js
 * Dedicated API router for MAGIC Youth Verified Impact Outcomes & Metrics.
 * Uses MongoDB Atlas (impacts collection) as the permanent source of truth
 * and Supabase Storage for permanent posters/graphics.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Impact = require('../database/models/Impact');
const { connectDB } = require('../database/mongoose');
const supabase = require('../utils/supabaseClient');
const { BUCKETS, uploadFile, deleteFile } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// Ensure MongoDB Atlas connection for all impact requests
router.use(async (req, res, next) => {
  try {
    const conn = await connectDB();
    if (!conn) {
      return res.status(503).json({ success: false, message: 'Database service unavailable. Please check MongoDB Atlas connection.' });
    }
    next();
  } catch (err) {
    console.error('[MongoDB Impact Route Error]', err.message);
    return res.status(503).json({ success: false, message: `Database connection failure: ${err.message}` });
  }
});

// Multer storage for impact images
const tmpDir = os.tmpdir();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `impact-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
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

async function processImpactImage(file) {
  if (!file) return null;
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const destName = `impact/${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

  try {
    const targetBucket = BUCKETS.EVENTS || BUCKETS.GALLERY || 'events';
    const { publicUrl } = await uploadFile(targetBucket, filePath, destName, file.mimetype);
    if (publicUrl) return publicUrl;
  } catch (supaErr) {
    console.warn('[Supabase Impact Image Upload Note]', supaErr.message);
  }

  try {
    const publicUploadDir = path.join(__dirname, '..', 'uploads', 'impact');
    if (!fs.existsSync(publicUploadDir)) {
      fs.mkdirSync(publicUploadDir, { recursive: true });
    }
    const publicFileName = `${Date.now()}-${path.basename(filePath)}`;
    const targetPath = path.join(publicUploadDir, publicFileName);
    fs.copyFileSync(filePath, targetPath);
    return `/uploads/impact/${publicFileName}`;
  } catch {}

  try {
    const buffer = fs.readFileSync(filePath);
    return `data:${file.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

// Helper to populate unit and academic year objects
async function populateImpactRelations(imp) {
  let unitObj = null;
  let yearObj = null;

  if (imp.unitId || imp.unit_id) {
    const uId = imp.unitId || imp.unit_id;
    try {
      const { data: u } = await supabase.from('units').select('id, name, code').eq('id', uId).single();
      if (u) unitObj = { _id: u.id, id: u.id, name: u.name, code: u.code };
    } catch {}
  }

  if (imp.academicYearId || imp.academic_year_id) {
    const yId = imp.academicYearId || imp.academic_year_id;
    try {
      const { data: y } = await supabase.from('academic_years').select('id, year').eq('id', yId).single();
      if (y) yearObj = { _id: y.id, id: y.id, year: y.year };
    } catch {}
  }

  return {
    ...imp,
    _id: imp._id || imp.id,
    id: imp._id || imp.id,
    unitId: unitObj || (imp.unitId ? { _id: imp.unitId, id: imp.unitId, name: 'Campus Unit' } : null),
    academicYearId: yearObj || (imp.academicYearId ? { _id: imp.academicYearId, id: imp.academicYearId, year: '2025-26' } : null),
  };
}

/**
 * GET /api/impact
 * Fetch all impact records from MongoDB Atlas with optional unit, academicYear, status, or search filters.
 */
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { unitId, academicYearId, status, search, all } = req.query;

    const filter = {};
    if (unitId && unitId !== 'All') filter.unitId = unitId;
    if (academicYearId && academicYearId !== 'All') filter.academicYearId = academicYearId;
    if (status && status !== 'All') {
      filter.status = status;
    } else if (all !== '1' && all !== 'true') {
      filter.status = 'Published';
    }

    let query = Impact.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    if (search) {
      query = Impact.find({
        ...filter,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { metricValue: { $regex: search, $options: 'i' } },
        ]
      }).sort({ displayOrder: 1, createdAt: -1 });
    }

    const mongoList = await query.exec();
    const list = (mongoList || []).map(i => i.toObject ? i.toObject() : i);
    const populated = await Promise.all(list.map(populateImpactRelations));
    res.json({ success: true, data: populated });
  } catch (err) {
    console.error('[GET /api/impact Error]', err.message);
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

/**
 * GET /api/impact/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const imp = await Impact.findById(req.params.id);
    if (!imp) return res.status(404).json({ success: false, message: 'Impact record not found.' });

    const populated = await populateImpactRelations(imp.toObject());
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/impact
 * Create a new impact outcome and persist directly to MongoDB Atlas.
 */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const { title, metricValue, description, date, status, unitId, academicYearId, displayOrder } = req.body;
    if (!title || !metricValue) {
      return res.status(400).json({ success: false, message: 'Title and metric value are required.' });
    }

    if (unitId && !canAccessUnit(req.admin, unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    let posterUrl = req.body.poster || null;
    if (req.file) {
      posterUrl = await processImpactImage(req.file);
    }

    const newImp = {
      title: title.trim(),
      metricValue: metricValue.trim(),
      description: description ? description.trim() : '',
      date: date || null,
      status: status || 'Published',
      unitId: unitId || null,
      academicYearId: academicYearId || null,
      poster: posterUrl,
      displayOrder: parseInt(displayOrder) || 0,
    };

    const created = await Impact.create(newImp);
    const saved = created.toObject();

    await logAction(req, 'Create Impact', 'Impact', saved._id, unitId);
    const populated = await populateImpactRelations(saved);
    res.status(201).json({ success: true, data: populated, message: 'Impact outcome created successfully.' });
  } catch (err) {
    console.error('[POST /api/impact Error]', err.message);
    res.status(500).json({ success: false, message: `Failed to save impact outcome: ${err.message}` });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * PUT /api/impact/:id
 * Update an impact record in MongoDB Atlas.
 */
router.put('/:id', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const existing = await Impact.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Impact record not found.' });

    const currentUnitId = existing.unitId || existing.unit_id;
    if (currentUnitId && !canAccessUnit(req.admin, currentUnitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    let posterUrl = existing.poster;
    if (req.body.removePoster === 'true' || req.body.removePoster === true) {
      posterUrl = null;
    }
    if (req.file) {
      posterUrl = await processImpactImage(req.file);
    }

    const updates = {
      title: req.body.title !== undefined ? req.body.title.trim() : existing.title,
      metricValue: req.body.metricValue !== undefined ? req.body.metricValue.trim() : existing.metricValue,
      description: req.body.description !== undefined ? req.body.description.trim() : existing.description,
      date: req.body.date !== undefined ? req.body.date : existing.date,
      status: req.body.status !== undefined ? req.body.status : existing.status,
      unitId: req.body.unitId !== undefined ? req.body.unitId : existing.unitId,
      academicYearId: req.body.academicYearId !== undefined ? req.body.academicYearId : existing.academicYearId,
      displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder) : existing.displayOrder,
      poster: posterUrl,
      updatedAt: new Date().toISOString(),
    };

    const updated = await Impact.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Impact record not found.' });

    await logAction(req, 'Edit Impact', 'Impact', req.params.id, updates.unitId);
    const populated = await populateImpactRelations(updated.toObject());
    res.json({ success: true, data: populated, message: 'Impact outcome updated successfully.' });
  } catch (err) {
    console.error(`[PUT /api/impact/${req.params.id} Error]`, err.message);
    res.status(500).json({ success: false, message: `Failed to update impact outcome: ${err.message}` });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * DELETE /api/impact/:id
 */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const existing = await Impact.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Impact record not found.' });

    const currentUnitId = existing.unitId || existing.unit_id;
    if (currentUnitId && !canAccessUnit(req.admin, currentUnitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await Impact.findByIdAndDelete(req.params.id);

    await logAction(req, 'Delete Impact', 'Impact', req.params.id);
    res.json({ success: true, message: 'Impact outcome deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
