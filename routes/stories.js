/**
 * routes/stories.js
 * API router for MAGIC Youth Stories & Testimonials management.
 * Supports image uploads via Supabase Storage / local fallback, and MongoDB Atlas.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Story = require('../database/models/Story');
const supabase = require('../utils/supabaseClient');
const { BUCKETS, uploadFile } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// Setup multer for story cover images
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

// Helper function to upload local file to Supabase or local storage
async function processImageFile(file) {
  if (!file) return null;
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const destName = `stories/${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

  // 1. Try Supabase Storage (Events or Gallery bucket)
  try {
    const targetBucket = BUCKETS.EVENTS || BUCKETS.GALLERY || 'events';
    const { publicUrl } = await uploadFile(targetBucket, filePath, destName, file.mimetype);
    if (publicUrl) return publicUrl;
  } catch (supaErr) {
    console.warn('[Supabase Story Image Upload Note]', supaErr.message);
  }

  // 2. Try writing to public uploads directory
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

  // 3. Fallback: Base64 data URL
  try {
    const buffer = fs.readFileSync(filePath);
    return `data:${file.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

// In-memory cache fallback for resilient zero-downtime serving
let memoryStories = [];

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
 * Fetch all stories. Public gets only Published unless ?all=1 or status parameter provided.
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

    if (unitId) filter.unitId = unitId;
    if (academicYear) filter.academicYear = academicYear;

    let mongoList = [];
    try {
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
      mongoList = await query.exec();
    } catch {}

    if (mongoList && mongoList.length > 0) {
      const formatted = mongoList.map(mapStoryResponse);
      memoryStories = formatted;
      return res.json({ success: true, data: formatted });
    }

    // Filter memory cache fallback
    let filteredMemory = memoryStories;
    if (filter.status) {
      filteredMemory = filteredMemory.filter(m => m.status === filter.status);
    }
    if (search) {
      const s = search.toLowerCase();
      filteredMemory = filteredMemory.filter(m => 
        (m.title && m.title.toLowerCase().includes(s)) ||
        (m.subtitle && m.subtitle.toLowerCase().includes(s)) ||
        (m.program && m.program.toLowerCase().includes(s))
      );
    }

    res.json({ success: true, data: filteredMemory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: memoryStories });
  }
});

/**
 * GET /api/stories/:id
 * Get single story by ID.
 */
router.get('/:id', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    try {
      const story = await Story.findById(req.params.id);
      if (story) {
        return res.json({ success: true, data: mapStoryResponse(story) });
      }
    } catch {}

    const mem = memoryStories.find(m => m._id === req.params.id || m.id === req.params.id);
    if (mem) {
      return res.json({ success: true, data: mem });
    }

    res.status(404).json({ success: false, message: 'Story not found.' });
  } catch (err) {
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
 * Create a new story. Supports multipart/form-data with coverImage file OR json with coverImage url.
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

    let savedStory = null;

    // 1. Save to MongoDB
    try {
      const storyDoc = new Story(newStoryData);
      savedStory = await storyDoc.save();
    } catch (dbErr) {
      console.warn('[MongoDB Story Save Note]', dbErr.message);
    }

    const storyResult = savedStory 
      ? mapStoryResponse(savedStory)
      : {
          ...newStoryData,
          _id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    // Update memory cache
    memoryStories.unshift(storyResult);

    try {
      await logAction(req, 'Create Story', 'Story', storyResult._id, unitId || null);
    } catch {}

    const io = req.app.get('io');
    if (io) {
      io.emit('story-created', storyResult);
    }

    res.status(201).json({
      success: true,
      message: 'Story created successfully.',
      data: storyResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * PUT /api/stories/:id
 * Update an existing story.
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

    const updates = { updatedAt: new Date().toISOString() };
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

    let updatedStory = null;

    // 1. Try Mongo
    try {
      updatedStory = await Story.findByIdAndUpdate(req.params.id, updates, { new: true });
    } catch {}

    let formattedResult;
    if (updatedStory) {
      formattedResult = mapStoryResponse(updatedStory);
    } else {
      // 2. Fallback memory
      const idx = memoryStories.findIndex(m => m._id === req.params.id || m.id === req.params.id);
      if (idx !== -1) {
        memoryStories[idx] = { ...memoryStories[idx], ...updates };
        formattedResult = memoryStories[idx];
      }
    }

    if (!formattedResult) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }

    // Update in-memory cache list
    const mIdx = memoryStories.findIndex(m => m._id === req.params.id || m.id === req.params.id);
    if (mIdx !== -1) {
      memoryStories[mIdx] = formattedResult;
    } else {
      memoryStories.unshift(formattedResult);
    }

    try {
      await logAction(req, 'Update Story', 'Story', req.params.id, unitId || null);
    } catch {}

    const io = req.app.get('io');
    if (io) {
      io.emit('story-updated', formattedResult);
    }

    res.json({
      success: true,
      message: 'Story updated successfully.',
      data: formattedResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

/**
 * DELETE /api/stories/:id
 * Delete a story.
 */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let deleted = false;
    try {
      const resDoc = await Story.findByIdAndDelete(req.params.id);
      if (resDoc) deleted = true;
    } catch {}

    memoryStories = memoryStories.filter(m => m._id !== req.params.id && m.id !== req.params.id);

    try {
      await logAction(req, 'Delete Story', 'Story', req.params.id, null);
    } catch {}

    const io = req.app.get('io');
    if (io) {
      io.emit('story-deleted', { id: req.params.id });
    }

    res.json({ success: true, message: 'Story deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
