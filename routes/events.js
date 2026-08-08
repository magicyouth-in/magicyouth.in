/**
 * routes/events.js
 * CRUD for Events linked to Unit and Academic Year using Supabase PostgreSQL & Storage.
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
const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpeg|jpg|png|gif|webp|pdf|heic|heif)$/i;
  const allowedMimes = [
    'image/jpeg','image/jpg','image/png','image/gif','image/webp',
    'image/heic','image/heif','image/heic-sequence','image/heif-sequence',
    'application/pdf',
  ];
  if (allowedExts.test(path.extname(file.originalname)) || allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files (JPEG, PNG, WEBP, GIF, HEIC) and PDF files are allowed.'));
};
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 }, fileFilter });

/** GET /api/events */
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('events')
      .select('*, units(name, code), academic_years(year)', { count: 'exact' })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.academicYearId) query = query.eq('academic_year_id', req.query.academicYearId);
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.category) query = query.eq('category', req.query.category);
    if (req.query.search) query = query.ilike('title', `%${req.query.search}%`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    query = query.range(skip, skip + limit - 1);

    const { data: events, count, error } = await query;
    if (error) throw error;

    const formatted = (events || []).map(e => ({
      ...e,
      _id: e.id,
      unitId: e.unit_id ? { _id: e.unit_id, id: e.unit_id, name: e.units?.name || '', code: e.units?.code || '' } : null,
      academicYearId: e.academic_year_id ? { _id: e.academic_year_id, id: e.academic_year_id, year: e.academic_years?.year || '' } : null,
      registrationEnabled: e.registration_enabled,
      startTime: e.start_time,
      endTime: e.end_time,
    }));

    res.json({ success: true, data: formatted, pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/events/:id */
router.get('/:id', async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*, units(name, code), academic_years(year)')
      .eq('id', req.params.id)
      .single();

    if (error || !event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const formatted = {
      ...event,
      _id: event.id,
      unitId: event.unit_id ? { _id: event.unit_id, id: event.unit_id, name: event.units?.name || '', code: event.units?.code || '' } : null,
      academicYearId: event.academic_year_id ? { _id: event.academic_year_id, id: event.academic_year_id, year: event.academic_years?.year || '' } : null,
      registrationEnabled: event.registration_enabled,
      startTime: event.start_time,
      endTime: event.end_time,
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid event ID.' });
  }
});

/** POST /api/events */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const { title, description, unitId, academicYearId, category, status, date, startTime, endTime, location, registrationEnabled, organizers } = req.body;
    if (!title || !unitId || !academicYearId) return res.status(400).json({ success: false, message: 'Title, unitId, and academicYearId are required.' });

    if (!canAccessUnit(req.admin, unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    let posterUrl = null;
    if (tmpFile) {
      const destination = `events/${Date.now()}-${path.basename(tmpFile)}`;
      const { publicUrl } = await uploadFile(BUCKETS.EVENTS, tmpFile, destination, req.file.mimetype);
      posterUrl = publicUrl;
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert([{
        title,
        description: description || '',
        unit_id: unitId,
        academic_year_id: academicYearId,
        category: category || 'Other',
        status: status || 'Upcoming',
        date: date || null,
        start_time: startTime || null,
        end_time: endTime || null,
        location: location || '',
        poster: posterUrl,
        registration_enabled: registrationEnabled === 'true',
        organizers: organizers || '',
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Create Event', 'Event', event.id, unitId);
    const io = req.app.get('io');
    if (io) io.emit('event-updated', { action: 'create', event: { ...event, _id: event.id } });

    res.status(201).json({ success: true, data: { ...event, _id: event.id }, message: 'Event created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

/** PUT /api/events/:id */
router.put('/:id', authenticateAdmin, requireAnyAdmin, upload.single('poster'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const { data: event } = await supabase.from('events').select('*').eq('id', req.params.id).single();
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!canAccessUnit(req.admin, event.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    let posterUrl = event.poster;
    if (tmpFile) {
      if (event.poster) await deleteFile(BUCKETS.EVENTS, event.poster);
      const destination = `events/${Date.now()}-${path.basename(tmpFile)}`;
      const { publicUrl } = await uploadFile(BUCKETS.EVENTS, tmpFile, destination, req.file.mimetype);
      posterUrl = publicUrl;
    }

    const updates = { updated_at: new Date().toISOString() };
    const fieldsMap = {
      title: 'title', description: 'description', category: 'category', status: 'status',
      date: 'date', startTime: 'start_time', endTime: 'end_time', location: 'location', organizers: 'organizers'
    };

    Object.keys(fieldsMap).forEach(key => {
      if (req.body[key] !== undefined) updates[fieldsMap[key]] = req.body[key];
    });

    if (req.body.registrationEnabled !== undefined) updates.registration_enabled = req.body.registrationEnabled === 'true';
    if (posterUrl) updates.poster = posterUrl;

    const { data: updated, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Edit Event', 'Event', updated.id, event.unit_id);
    const io = req.app.get('io');
    if (io) io.emit('event-updated', { action: 'update', event: { ...updated, _id: updated.id } });

    res.json({ success: true, data: { ...updated, _id: updated.id }, message: 'Event updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

/** DELETE /api/events/:id */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: event } = await supabase.from('events').select('*').eq('id', req.params.id).single();
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!canAccessUnit(req.admin, event.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    if (event.poster) await deleteFile(BUCKETS.EVENTS, event.poster);

    await supabase.from('events').delete().eq('id', event.id);
    await logAction(req, 'Delete Event', 'Event', event.id, event.unit_id);

    const io = req.app.get('io');
    if (io) io.emit('event-updated', { action: 'delete', eventId: event.id });

    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
