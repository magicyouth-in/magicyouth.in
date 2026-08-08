/**
 * routes/gallery.js
 * Gallery photo metadata CRUD using Supabase PostgreSQL & Storage.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../utils/supabaseClient');
const { BUCKETS, uploadFile, deleteFile } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

const os = require('os');
const tmpDir = os.tmpdir();
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, tmpDir); },
  filename:    (req, file, cb) => { cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`); },
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowedExts = /\.(jpeg|jpg|png|gif|webp|pdf|heic|heif)$/i;
  const allowedMimes = [
    'image/jpeg','image/jpg','image/png','image/gif','image/webp',
    'image/heic','image/heif','image/heic-sequence','image/heif-sequence',
    'application/pdf',
  ];
  if (allowedExts.test(path.extname(file.originalname)) || allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files (JPEG, PNG, WEBP, GIF, HEIC) and PDF files are allowed.'));
}});

/** GET /api/gallery */
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('gallery')
      .select('*, units(name, code), academic_years(year), events(title)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.academicYearId) query = query.eq('academic_year_id', req.query.academicYearId);
    if (req.query.eventId) query = query.eq('event_id', req.query.eventId);
    if (req.query.album) query = query.eq('album', req.query.album);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    query = query.range(skip, skip + limit - 1);

    const { data: photos, count, error } = await query;
    if (error) throw error;

    const formatted = (photos || []).map(p => ({
      ...p,
      _id: p.id,
      filePath: p.file_path,
      unitId: p.unit_id ? { _id: p.unit_id, id: p.unit_id, name: p.units?.name || '', code: p.units?.code || '' } : null,
      academicYearId: p.academic_year_id ? { _id: p.academic_year_id, id: p.academic_year_id, year: p.academic_years?.year || '' } : null,
      eventId: p.event_id ? { _id: p.event_id, id: p.event_id, title: p.events?.title || '' } : null,
    }));

    res.json({ success: true, data: formatted, pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/gallery/albums */
router.get('/albums', async (req, res) => {
  try {
    let query = supabase.from('gallery').select('album, unit_id, academic_year_id, file_path, created_at');
    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.academicYearId) query = query.eq('academic_year_id', req.query.academicYearId);

    const { data: items, error } = await query;
    if (error) throw error;

    const albumsMap = {};
    (items || []).forEach(item => {
      const albumName = item.album || 'General';
      if (!albumsMap[albumName]) {
        albumsMap[albumName] = {
          album: albumName,
          photoCount: 0,
          coverPhoto: item.file_path,
          lastUpdated: item.created_at,
        };
      }
      albumsMap[albumName].photoCount++;
    });

    res.json({ success: true, data: Object.values(albumsMap) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/gallery/:id */
router.get('/:id', async (req, res) => {
  try {
    const { data: photo, error } = await supabase
      .from('gallery')
      .select('*, units(name, code), academic_years(year), events(title)')
      .eq('id', req.params.id)
      .single();

    if (error || !photo) return res.status(404).json({ success: false, message: 'Photo not found.' });

    const formatted = {
      ...photo,
      _id: photo.id,
      filePath: photo.file_path,
      unitId: photo.unit_id ? { _id: photo.unit_id, id: photo.unit_id, name: photo.units?.name || '', code: photo.units?.code || '' } : null,
      academicYearId: photo.academic_year_id ? { _id: photo.academic_year_id, id: photo.academic_year_id, year: photo.academic_years?.year || '' } : null,
      eventId: photo.event_id ? { _id: photo.event_id, id: photo.event_id, title: photo.events?.title || '' } : null,
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** POST /api/gallery — Upload photo(s) */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.array('photos', 30), async (req, res) => {
  const tmpFiles = (req.files || []).map(f => f.path);
  try {
    const { unitId, academicYearId, eventId, album, category, title, description } = req.body;
    if (!unitId || !academicYearId) return res.status(400).json({ success: false, message: 'unitId and academicYearId are required.' });
    if (!tmpFiles.length) return res.status(400).json({ success: false, message: 'At least one photo is required.' });
    if (!canAccessUnit(req.admin, unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const docs = [];

    for (let i = 0; i < tmpFiles.length; i++) {
      const tmpFile = tmpFiles[i];
      const destination = `gallery/${Date.now()}-${i}-${path.basename(tmpFile)}`;
      const { publicUrl } = await uploadFile(BUCKETS.GALLERY, tmpFile, destination, req.files[i].mimetype);

      docs.push({
        unit_id: unitId,
        academic_year_id: academicYearId,
        event_id: eventId || null,
        album: album || '',
        category: category || 'General',
        title: title || '',
        description: description || '',
        file_path: publicUrl,
      });
    }

    const { data: inserted, error } = await supabase.from('gallery').insert(docs).select();
    if (error) throw error;

    await logAction(req, 'Upload Gallery Photos', 'Gallery', null, unitId);
    res.status(201).json({ success: true, message: `${inserted.length} photo(s) uploaded.`, count: inserted.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    tmpFiles.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
  }
});

/** DELETE /api/gallery/:id */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: photo } = await supabase.from('gallery').select('*').eq('id', req.params.id).single();
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });
    if (!canAccessUnit(req.admin, photo.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    if (photo.file_path) await deleteFile(BUCKETS.GALLERY, photo.file_path);

    await supabase.from('gallery').delete().eq('id', photo.id);
    await logAction(req, 'Delete Gallery Photo', 'Gallery', photo.id, photo.unit_id);

    res.json({ success: true, message: 'Photo deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
