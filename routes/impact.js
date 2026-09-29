/**
 * routes/impact.js
 * Dedicated API router for MAGIC Youth Verified Impact Outcomes & Metrics.
 * Supports image uploads via Supabase Storage / local fallback, and MongoDB / Supabase.
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
    await connectDB();
  } catch (err) {
    console.warn('[MongoDB Impact Route Note]', err.message);
  }
  next();
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

// In-memory cache for zero-downtime resilience
let memoryImpacts = [
  {
    _id: 'imp-1',
    id: 'imp-1',
    title: 'People Supported',
    metricValue: '21',
    description: 'Individuals provided with direct crisis assistance, essential support kits, and healthcare solidarity.',
    poster: null,
    unitId: null,
    academicYearId: null,
    status: 'Published',
    date: '2025-08-15',
  },
  {
    _id: 'imp-2',
    id: 'imp-2',
    title: 'Students Connected to Counselling',
    metricValue: '4',
    description: 'Youth guided through specialized professional psychological support during mental wellness awareness campaigns.',
    poster: null,
    unitId: null,
    academicYearId: null,
    status: 'Published',
    date: '2025-09-10',
  }
];

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
 * Fetch all impact records with optional unit, academicYear, status, or search filters.
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

    let mongoList = null;
    try {
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
      mongoList = await query.exec();
    } catch (dbErr) {
      console.warn('[MongoDB Impact Query Note]', dbErr.message);
    }

    let list = [];
    if (mongoList !== null) {
      list = mongoList.map(i => i.toObject ? i.toObject() : i);
      if (list.length > 0) {
        memoryImpacts = list;
      }
    } else {
      list = memoryImpacts.filter(i => {
        const unitMatch = !unitId || unitId === 'All' || i.unitId === unitId || i.unitId?._id === unitId;
        const yearMatch = !academicYearId || academicYearId === 'All' || i.academicYearId === academicYearId || i.academicYearId?._id === academicYearId;
        const statusMatch = !status || status === 'All' || (i.status || '').toLowerCase() === status.toLowerCase();
        const searchMatch = !search || (
          (i.title && i.title.toLowerCase().includes(search.toLowerCase())) ||
          (i.description && i.description.toLowerCase().includes(search.toLowerCase())) ||
          (i.metricValue && i.metricValue.toLowerCase().includes(search.toLowerCase()))
        );
        return unitMatch && yearMatch && statusMatch && searchMatch;
      });
    }

    const populated = await Promise.all(list.map(populateImpactRelations));
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: memoryImpacts });
  }
});

/**
 * GET /api/impact/:id
 */
router.get('/:id', async (req, res) => {
  try {
    let imp = null;
    try {
      imp = await Impact.findById(req.params.id);
      if (imp) imp = imp.toObject();
    } catch {}

    if (!imp) {
      imp = memoryImpacts.find(i => i._id === req.params.id || i.id === req.params.id);
    }

    if (!imp) return res.status(404).json({ success: false, message: 'Impact record not found.' });

    const populated = await populateImpactRelations(imp);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/impact
 * Create a new impact record.
 */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const { title, metricValue, description, unitId, academicYearId, programId, eventId, status, date, displayOrder } = req.body;
    if (!title || !metricValue) {
      return res.status(400).json({ success: false, message: 'Title and metricValue are required.' });
    }

    if (unitId && !canAccessUnit(req.admin, unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    let posterUrl = req.body.poster || null;
    if (req.file) {
      posterUrl = await processImpactImage(req.file);
    }

    const newImp = {
      title,
      metricValue,
      description: description || '',
      poster: posterUrl,
      unitId: unitId || null,
      academicYearId: academicYearId || null,
      programId: programId || null,
      eventId: eventId || null,
      status: status || 'Published',
      date: date || new Date().toISOString().split('T')[0],
      displayOrder: parseInt(displayOrder) || 0,
    };

    let saved = null;
    try {
      saved = await Impact.create(newImp);
      saved = saved.toObject();
    } catch {
      saved = {
        ...newImp,
        _id: `imp-${Date.now()}`,
        id: `imp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryImpacts.unshift(saved);
    }

    await logAction(req, 'Create Impact Record', 'Impact', saved._id || saved.id, unitId);
    const populated = await populateImpactRelations(saved);
    res.status(201).json({ success: true, data: populated, message: 'Impact record created successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * PUT /api/impact/:id
 * Update an existing impact record.
 */
router.put('/:id', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    let existing = null;
    try {
      existing = await Impact.findById(req.params.id);
    } catch {}

    if (!existing) {
      existing = memoryImpacts.find(i => i._id === req.params.id || i.id === req.params.id);
    }

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
      title: req.body.title !== undefined ? req.body.title : existing.title,
      metricValue: req.body.metricValue !== undefined ? req.body.metricValue : existing.metricValue,
      description: req.body.description !== undefined ? req.body.description : existing.description,
      poster: posterUrl,
      unitId: req.body.unitId !== undefined ? req.body.unitId : existing.unitId,
      academicYearId: req.body.academicYearId !== undefined ? req.body.academicYearId : existing.academicYearId,
      programId: req.body.programId !== undefined ? req.body.programId : existing.programId,
      eventId: req.body.eventId !== undefined ? req.body.eventId : existing.eventId,
      status: req.body.status !== undefined ? req.body.status : existing.status,
      date: req.body.date !== undefined ? req.body.date : existing.date,
      displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder) : existing.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    let updated = null;
    try {
      updated = await Impact.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (updated) updated = updated.toObject();
    } catch {}

    if (!updated) {
      const idx = memoryImpacts.findIndex(i => i._id === req.params.id || i.id === req.params.id);
      if (idx !== -1) {
        memoryImpacts[idx] = { ...memoryImpacts[idx], ...updates };
        updated = memoryImpacts[idx];
      } else {
        updated = { _id: req.params.id, id: req.params.id, ...updates };
        memoryImpacts.unshift(updated);
      }
    }

    await logAction(req, 'Edit Impact Record', 'Impact', req.params.id, updates.unitId);
    const populated = await populateImpactRelations(updated);
    res.json({ success: true, data: populated, message: 'Impact record updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    let existing = null;
    try {
      existing = await Impact.findById(req.params.id);
      if (existing) await Impact.findByIdAndDelete(req.params.id);
    } catch {}

    memoryImpacts = memoryImpacts.filter(i => i._id !== req.params.id && i.id !== req.params.id);

    await logAction(req, 'Delete Impact Record', 'Impact', req.params.id);
    res.json({ success: true, message: 'Impact record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
