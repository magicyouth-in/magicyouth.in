/**
 * routes/documents.js
 * Documentation CRUD using Supabase PostgreSQL & Storage.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');
const { BUCKETS, uploadFile, deleteFile } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'MagicYouth_JWT_FallbackSecret';

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

const tmpDir = path.join(__dirname, '..', 'uploads', 'tmp');
const storage = multer.diskStorage({
  destination: (req, file, cb) => { try { fs.mkdirSync(tmpDir, { recursive: true }); } catch {} cb(null, tmpDir); },
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

async function getAuthAdmin(req) {
  const token = req.cookies?.magicyouth_token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { data: admin } = await supabase.from('admin_users').select('*').eq('id', decoded.adminId).single();
    return admin && admin.status === 'Active' ? admin : null;
  } catch {
    return null;
  }
}

/** GET /api/documents */
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

    let query = supabase
      .from('documents')
      .select('*, units(name, code), academic_years(year), events(title)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (authAdmin.role !== 'MAIN_ADMIN') {
      query = query.neq('visibility', 'Admin Only');
      if (authAdmin.assigned_unit_ids?.length > 0) {
        query = query.in('unit_id', authAdmin.assigned_unit_ids);
      }
    }

    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.academicYearId) query = query.eq('academic_year_id', req.query.academicYearId);
    if (req.query.eventId) query = query.eq('event_id', req.query.eventId);
    if (req.query.documentType) query = query.eq('document_type', req.query.documentType);
    if (req.query.search) query = query.ilike('title', `%${req.query.search}%`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    query = query.range(skip, skip + limit - 1);

    const { data: docs, count, error } = await query;
    if (error) throw error;

    const formatted = (docs || []).map(d => ({
      ...d,
      _id: d.id,
      filePath: d.file_path,
      fileSize: d.file_size,
      mimeType: d.mime_type,
      documentType: d.document_type,
      downloadsCount: d.downloads_count,
      unitId: d.unit_id ? { _id: d.unit_id, id: d.unit_id, name: d.units?.name || '', code: d.units?.code || '' } : null,
      academicYearId: d.academic_year_id ? { _id: d.academic_year_id, id: d.academic_year_id, year: d.academic_years?.year || '' } : null,
      eventId: d.event_id ? { _id: d.event_id, id: d.event_id, title: d.events?.title || '' } : null,
    }));

    res.json({ success: true, authenticated: true, admin: { name: authAdmin.name, email: authAdmin.email, role: authAdmin.role }, data: formatted, pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/documents/admin/all — Admin full list */
router.get('/admin/all', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let query = supabase
      .from('documents')
      .select('*, units(name, code), academic_years(year), events(title)')
      .order('created_at', { ascending: false });

    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.academicYearId) query = query.eq('academic_year_id', req.query.academicYearId);
    if (req.query.documentType) query = query.eq('document_type', req.query.documentType);
    if (req.query.search) query = query.ilike('title', `%${req.query.search}%`);

    if (req.admin.role === 'SUB_ADMIN' && req.admin.assigned_unit_ids?.length > 0) {
      query = query.in('unit_id', req.admin.assigned_unit_ids);
    }

    const { data: docs, error } = await query;
    if (error) throw error;

    const formatted = (docs || []).map(d => ({
      ...d,
      _id: d.id,
      filePath: d.file_path,
      fileSize: d.file_size,
      mimeType: d.mime_type,
      documentType: d.document_type,
      downloadsCount: d.downloads_count,
      unitId: d.unit_id ? { _id: d.unit_id, id: d.unit_id, name: d.units?.name || '', code: d.units?.code || '' } : null,
      academicYearId: d.academic_year_id ? { _id: d.academic_year_id, id: d.academic_year_id, year: d.academic_years?.year || '' } : null,
      eventId: d.event_id ? { _id: d.event_id, id: d.event_id, title: d.events?.title || '' } : null,
    }));

    res.json({ success: true, data: formatted });
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

    const destination = `documents/${Date.now()}-${path.basename(tmpFile)}`;
    const { publicUrl } = await uploadFile(BUCKETS.DOCUMENTS, tmpFile, destination, req.file.mimetype);

    const { data: doc, error } = await supabase
      .from('documents')
      .insert([{
        title,
        description: description || '',
        unit_id: unitId,
        academic_year_id: academicYearId,
        event_id: eventId || null,
        document_type: documentType || 'Other Documents',
        file_path: publicUrl,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        visibility: visibility || 'Public',
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Upload Document', 'Document', doc.id, unitId);
    res.status(201).json({ success: true, data: { ...doc, _id: doc.id, filePath: doc.file_path }, message: 'Document uploaded.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

/** DELETE /api/documents/:id */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: doc } = await supabase.from('documents').select('*').eq('id', req.params.id).single();
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (!canAccessUnit(req.admin, doc.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    if (doc.file_path) await deleteFile(BUCKETS.DOCUMENTS, doc.file_path);

    await supabase.from('documents').delete().eq('id', doc.id);
    await logAction(req, 'Delete Document', 'Document', doc.id, doc.unit_id);

    res.json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/documents/:id/visibility */
router.patch('/:id/visibility', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: doc } = await supabase.from('documents').select('*').eq('id', req.params.id).single();
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (!canAccessUnit(req.admin, doc.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const newVisibility = req.body.visibility === 'Admin Only' ? 'Admin Only' : 'Public';
    const { data: updated, error } = await supabase
      .from('documents')
      .update({ visibility: newVisibility, updated_at: new Date().toISOString() })
      .eq('id', doc.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: { ...updated, _id: updated.id, filePath: updated.file_path }, message: 'Visibility updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
