/**
 * routes/join.js
 * API router for volunteer join requests using Supabase PostgreSQL.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');

const os = require('os');
const tmpDir = os.tmpdir();
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, tmpDir); },
  filename:    (req, file, cb) => { cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`); },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const parseArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { const p = JSON.parse(val); if (Array.isArray(p)) return p; } catch {}
  return typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
};

/** POST /api/join */
router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'profileImage', maxCount: 1 }]), async (req, res) => {
  const tmpFiles = [];
  if (req.files?.resume?.[0])       tmpFiles.push(req.files.resume[0].path);
  if (req.files?.profileImage?.[0]) tmpFiles.push(req.files.profileImage[0].path);

  try {
    const { name, email, phone, gender, dob, college, department, year, city, unitId, academicYearId, skills, interests, previousExperience, reason } = req.body;
    if (!name || !email || !phone || !college || !department || !year || !city || !reason) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    const { data: application, error } = await supabase
      .from('join_requests')
      .insert([{
        name,
        email,
        phone,
        gender: gender || 'Male',
        dob: dob || null,
        college,
        department,
        year,
        city,
        unit_id: unitId || null,
        academic_year_id: academicYearId || null,
        skills: parseArray(skills),
        interests: parseArray(interests),
        previous_experience: previousExperience || '',
        reason,
        status: 'Pending',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Application submitted! Our team will review it soon.',
      data: { ...application, _id: application.id }
    });
  } catch (err) {
    console.error('[JOIN ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  } finally {
    tmpFiles.forEach(f => { if (f && fs.existsSync(f)) fs.unlinkSync(f); });
  }
});

/** GET /api/join — Admin: list applications */
router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let query = supabase
      .from('join_requests')
      .select('*, units(name, code)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);

    if (req.admin.role === 'SUB_ADMIN' && req.admin.assigned_unit_ids?.length > 0) {
      query = query.in('unit_id', req.admin.assigned_unit_ids);
    }

    if (req.query.search) {
      query = query.or(`name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%,college.ilike.%${req.query.search}%,department.ilike.%${req.query.search}%`);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const formatted = (data || []).map(j => ({
      ...j,
      _id: j.id,
      previousExperience: j.previous_experience,
      adminNotes: j.admin_notes,
      unitId: j.unit_id ? { _id: j.unit_id, id: j.unit_id, name: j.units?.name || '', code: j.units?.code || '' } : null,
    }));

    res.json({ success: true, data: formatted, pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/join/:id */
router.get('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: req_, error } = await supabase
      .from('join_requests')
      .select('*, units(name, code), academic_years(year)')
      .eq('id', req.params.id)
      .single();

    if (error || !req_) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (req_.unit_id && !canAccessUnit(req.admin, req_.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const formatted = {
      ...req_,
      _id: req_.id,
      previousExperience: req_.previous_experience,
      adminNotes: req_.admin_notes,
      unitId: req_.unit_id ? { _id: req_.unit_id, id: req_.unit_id, name: req_.units?.name || '', code: req_.units?.code || '' } : null,
      academicYearId: req_.academic_year_id ? { _id: req_.academic_year_id, id: req_.academic_year_id, year: req_.academic_years?.year || '' } : null,
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** PATCH /api/join/:id/status */
router.patch('/:id/status', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const { data: application } = await supabase.from('join_requests').select('*').eq('id', req.params.id).single();
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.unit_id && !canAccessUnit(req.admin, application.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const updates = { status, updated_at: new Date().toISOString() };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const { data: updated, error } = await supabase
      .from('join_requests')
      .update(updates)
      .eq('id', application.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: `Application ${status.toLowerCase()}.`, data: { ...updated, _id: updated.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
