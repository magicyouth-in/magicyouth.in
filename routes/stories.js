/**
 * routes/stories.js
 * Production API router for MAGIC Youth Stories & Testimonials.
 * Uses MongoDB Atlas (stories collection) as the permanent source of truth
 * and Supabase Storage for permanent cover image assets.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Story = require('../database/models/Story');
const { connectDB } = require('../database/mongoose');
const { BUCKETS, uploadFile } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// Ensure MongoDB Atlas connection before handling any story requests
router.use(async (req, res, next) => {
  try {
    const conn = await connectDB();
    if (!conn) {
      return res.status(503).json({ success: false, message: 'Database service unavailable. Please check MongoDB Atlas connection.' });
    }
    next();
  } catch (err) {
    console.error('[MongoDB Story Route Error]', err.message);
    return res.status(503).json({ success: false, message: `Database connection failure: ${err.message}` });
  }
});

// Multer storage for story cover images
const tmpDir = os.tmpdir();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `story-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
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
  cb(new Error('Only image files (JPEG, JPG, PNG, WEBP, GIF, HEIC) are allowed for cover image.'));
};

const uploadCover = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter,
});

/**
 * Upload cover image to permanent Supabase Storage or public uploads folder
 */
async function processImageFile(file) {
  if (!file) return null;
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const destName = `stories/${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

  // 1. Try Supabase Storage (Permanent Public Asset)
  try {
    const targetBucket = BUCKETS.GALLERY || BUCKETS.EVENTS || 'gallery';
    const { publicUrl } = await uploadFile(targetBucket, filePath, destName, file.mimetype);
    if (publicUrl) return publicUrl;
  } catch (supaErr) {
    console.warn('[Supabase Story Image Upload Note]', supaErr.message);
  }

  // 2. Fallback: Public uploads directory
  try {
    const publicUploadDir = path.join(__dirname, '..', 'uploads', 'stories');
    if (!fs.existsSync(publicUploadDir)) {
      fs.mkdirSync(publicUploadDir, { recursive: true });
    }
    const publicFileName = `${Date.now()}-${path.basename(filePath)}`;
    const targetPath = path.join(publicUploadDir, publicFileName);
    fs.copyFileSync(filePath, targetPath);
    return `/uploads/stories/${publicFileName}`;
  } catch {}

  // 3. Fallback: Data URL
  try {
    const buffer = fs.readFileSync(filePath);
    return `data:${file.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

function mapStoryResponse(story) {
  const s = story.toObject ? story.toObject() : story;
  const id = s._id ? s._id.toString() : s.id;
  return {
    ...s,
    _id: id,
    id: id,
    title: s.title || '',
    subtitle: s.subtitle || '',
    coverImage: s.coverImage || s.cover_image || s.avatarUrl || '',
    content: s.content || s.fullStory || s.full_story || s.quote || '',
    impact: s.impact || '',
    academicYear: s.academicYear || s.academic_year || '',
    academicYearId: s.academicYearId || s.academic_year_id || null,
    chapter: s.chapter || s.unit || '',
    unitId: s.unitId || s.unit_id || null,
    program: s.program || '',
    status: s.status || 'Published',
    author: s.author || s.name || 'MAGIC Youth',
    // Backward compatibility for legacy testimonial consumers
    name: s.author || s.name || 'MAGIC Youth',
    role: s.chapter || s.program || 'Student Formation',
    unit: s.chapter || 'MAGIC Youth',
    quote: s.subtitle || s.impact || (s.content ? s.content.slice(0, 180) + '...' : ''),
    excerpt: s.subtitle || s.impact || (s.content ? s.content.slice(0, 180) + '...' : ''),
    fullStory: s.content || '',
    category: s.program || 'Impact Story',
    tag: s.impact ? 'Impact Milestone' : 'Transformation Story',
    isFeatured: !!s.isFeatured,
  };
}

/**
 * GET /api/stories
 * Fetch all stories from MongoDB Atlas.
 */
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { status, unitId, academicYear, search, all } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    } else if (all !== '1' && all !== 'true') {
      filter.status = 'Published';
    }

    if (unitId && unitId !== 'All') filter.unitId = unitId;
    if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;

    let query = Story.find(filter).sort({ createdAt: -1 });
    if (search) {
      query = Story.find({
        ...filter,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
          { impact: { $regex: search, $options: 'i' } },
          { program: { $regex: search, $options: 'i' } },
        ],
      }).sort({ createdAt: -1 });
    }

    const mongoList = await query.exec();
    const formatted = (mongoList || []).map(mapStoryResponse);
    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[GET /api/stories Error]', err.message);
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

/**
 * GET /api/stories/:id
 * Get single story by ID from MongoDB Atlas.
 */
router.get('/:id', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }
    return res.json({ success: true, data: mapStoryResponse(story) });
  } catch (err) {
    console.error(`[GET /api/stories/${req.params.id} Error]`, err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/stories/upload-image
 * Dedicated endpoint for uploading a cover image
 */
router.post('/upload-image', authenticateAdmin, requireAnyAdmin, uploadCover.single('coverImage'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    const imageUrl = await processImageFile(req.file);
    if (!imageUrl) {
      return res.status(500).json({ success: false, message: 'Failed to process image file.' });
    }
    res.json({ success: true, imageUrl, message: 'Image uploaded successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * POST /api/stories
 * Create a new story and permanently persist to MongoDB Atlas.
 */
router.post('/', authenticateAdmin, requireAnyAdmin, uploadCover.single('coverImage'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const {
      title,
      subtitle,
      content,
      impact,
      academicYear,
      academicYearId,
      chapter,
      unitId,
      program,
      status,
      author,
      isFeatured,
    } = req.body;

    let coverImageUrl = req.body.coverImage;
    if (req.file) {
      const uploadedUrl = await processImageFile(req.file);
      if (uploadedUrl) coverImageUrl = uploadedUrl;
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Story Title is required.' });
    }

    if (!coverImageUrl || !coverImageUrl.trim()) {
      return res.status(400).json({ success: false, message: 'Cover Image is required.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Story Content is required.' });
    }

    if (unitId && !canAccessUnit(req.admin, unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const newStoryData = {
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      coverImage: coverImageUrl.trim(),
      content: content.trim(),
      impact: impact ? impact.trim() : '',
      academicYear: academicYear ? academicYear.trim() : '',
      academicYearId: academicYearId || null,
      chapter: chapter ? chapter.trim() : '',
      unitId: unitId || null,
      program: program ? program.trim() : '',
      status: status === 'Draft' ? 'Draft' : 'Published',
      author: author ? author.trim() : 'MAGIC Youth',
      isFeatured: isFeatured === true || isFeatured === 'true',
    };

    // Save directly to MongoDB Atlas
    const storyDoc = new Story(newStoryData);
    const savedStory = await storyDoc.save();

    const storyResult = mapStoryResponse(savedStory);

    try {
      await logAction(req, 'Create Story', 'Story', storyResult._id, unitId || null);
    } catch {}

    const io = req.app.get('io');
    if (io) {
      io.emit('story-created', storyResult);
    }

    res.status(201).json({
      success: true,
      message: 'Story created successfully and stored in database.',
      data: storyResult,
    });
  } catch (err) {
    console.error('[POST /api/stories Save Error]', err.message);
    res.status(500).json({ success: false, message: `Failed to save story to database: ${err.message}` });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * PUT /api/stories/:id
 * Update an existing story in MongoDB Atlas.
 */
router.put('/:id', authenticateAdmin, requireAnyAdmin, uploadCover.single('coverImage'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const {
      title,
      subtitle,
      content,
      impact,
      academicYear,
      academicYearId,
      chapter,
      unitId,
      program,
      status,
      author,
      isFeatured,
    } = req.body;

    let newCoverUrl = req.body.coverImage;
    if (req.file) {
      const uploadedUrl = await processImageFile(req.file);
      if (uploadedUrl) newCoverUrl = uploadedUrl;
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (subtitle !== undefined) updates.subtitle = subtitle.trim();
    if (newCoverUrl) updates.coverImage = newCoverUrl.trim();
    if (content !== undefined) updates.content = content.trim();
    if (impact !== undefined) updates.impact = impact.trim();
    if (academicYear !== undefined) updates.academicYear = academicYear.trim();
    if (academicYearId !== undefined) updates.academicYearId = academicYearId;
    if (chapter !== undefined) updates.chapter = chapter.trim();
    if (unitId !== undefined) updates.unitId = unitId;
    if (program !== undefined) updates.program = program.trim();
    if (status !== undefined) updates.status = status;
    if (author !== undefined) updates.author = author.trim();
    if (isFeatured !== undefined) updates.isFeatured = isFeatured === true || isFeatured === 'true';

    const existingStory = await Story.findById(req.params.id);
    if (!existingStory) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }
    if (existingStory.unitId && !canAccessUnit(req.admin, existingStory.unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    if (unitId && !canAccessUnit(req.admin, unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const updatedStory = await Story.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updatedStory) {
      return res.status(404).json({ success: false, message: 'Story not found after update.' });
    }

    const formattedResult = mapStoryResponse(updatedStory);

    try {
      await logAction(req, 'Update Story', 'Story', req.params.id, unitId || existingStory.unitId || null);
    } catch {}

    const io = req.app.get('io');
    if (io) {
      io.emit('story-updated', formattedResult);
    }

    res.json({
      success: true,
      message: 'Story updated successfully in database.',
      data: formattedResult,
    });
  } catch (err) {
    console.error(`[PUT /api/stories/${req.params.id} Error]`, err.message);
    res.status(500).json({ success: false, message: `Failed to update story in database: ${err.message}` });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * DELETE /api/stories/:id
 * Delete a story permanently from MongoDB Atlas.
 */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const existingStory = await Story.findById(req.params.id);
    if (!existingStory) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }
    if (existingStory.unitId && !canAccessUnit(req.admin, existingStory.unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await Story.findByIdAndDelete(req.params.id);

    try {
      await logAction(req, 'Delete Story', 'Story', req.params.id, null);
    } catch {}

    const io = req.app.get('io');
    if (io) {
      io.emit('story-deleted', { id: req.params.id });
    }

    res.json({ success: true, message: 'Story deleted permanently from database.' });
  } catch (err) {
    console.error(`[DELETE /api/stories/${req.params.id} Error]`, err.message);
    res.status(500).json({ success: false, message: `Failed to delete story from database: ${err.message}` });
  }
});

module.exports = router;
