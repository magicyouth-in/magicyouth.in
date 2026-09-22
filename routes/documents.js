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
const { BUCKETS, uploadFile, deleteFile, createSignedUploadUrl } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'MagicYouth_JWT_FallbackSecret';

const ALLOWED_MIMES = [
  // PDF
  'application/pdf',
  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence',
  // Text
  'text/plain',
  // Zip / Archive
  'application/zip',
  'application/x-zip-compressed',
];

const os = require('os');
const tmpDir = os.tmpdir();
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, tmpDir); },
  filename:    (req, file, cb) => { cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`); },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB for documents
  fileFilter: (req, file, cb) => {
    // Allow if in ALLOWED_MIMES OR if extension matches common doc types
    const allowedExts = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|jpg|jpeg|png|gif|webp|svg|zip|heic|heif)$/i;
    if (ALLOWED_MIMES.includes(file.mimetype) || allowedExts.test(path.extname(file.originalname))) {
      return cb(null, true);
    }
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

/** GET /api/documents/download/:id — redirect to Supabase CDN URL */
router.get('/download/:id', async (req, res) => {
  try {
    const { data: doc } = await supabase.from('documents').select('file_path, title, mime_type, downloads_count').eq('id', req.params.id).single();
    if (!doc || !doc.file_path) return res.status(404).json({ success: false, message: 'Document not found.' });

    // Increment download count (fire-and-forget)
    supabase.from('documents').update({ downloads_count: (doc.downloads_count || 0) + 1 }).eq('id', req.params.id).then(() => {});

    // Redirect directly to Supabase Storage CDN URL
    res.redirect(doc.file_path);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/documents/public — Public list of published toolkits & resources */
router.get('/public', async (req, res) => {
  try {
    let query = supabase
      .from('documents')
      .select('*, units(name, code), academic_years(year)')
      .eq('visibility', 'Public')
      .order('created_at', { ascending: false });

    if (req.query.unitId && req.query.unitId !== 'All') query = query.eq('unit_id', req.query.unitId);
    if (req.query.academicYearId && req.query.academicYearId !== 'All') query = query.eq('academic_year_id', req.query.academicYearId);
    if (req.query.documentType && req.query.documentType !== 'All') query = query.eq('document_type', req.query.documentType);

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
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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

/** POST /api/documents/sign-upload — Generate pre-signed upload URL for direct-to-storage upload */
router.post('/sign-upload', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { fileName, fileType, fileSize, unitId } = req.body;
    if (!fileName) {
      return res.status(400).json({ success: false, message: 'File name is required.' });
    }
    if (unitId && !canAccessUnit(req.admin, unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot upload to this chapter.' });
    }

    // Size limit check (50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (fileSize && Number(fileSize) > MAX_SIZE) {
      return res.status(400).json({ success: false, message: 'File exceeds the maximum allowed size of 50MB.' });
    }

    // Extension and MIME validation
    const ext = path.extname(fileName).toLowerCase();
    const allowedExts = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|jpg|jpeg|png|gif|webp|svg|zip|heic|heif)$/i;
    if (!allowedExts.test(ext) && !ALLOWED_MIMES.includes(fileType)) {
      return res.status(400).json({ success: false, message: `File type "${ext || fileType}" is not supported. Please upload a PDF, document, spreadsheet, presentation, or image.` });
    }

    const cleanBaseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
    const destinationPath = `documents/${Date.now()}-${cleanBaseName}${ext}`;

    const { signedUrl, path: storagePath, token, publicUrl } = await createSignedUploadUrl(BUCKETS.DOCUMENTS, destinationPath);

    res.json({
      success: true,
      signedUrl,
      token,
      path: storagePath,
      publicUrl,
      fileName,
      fileSize: fileSize || 0,
      mimeType: fileType || 'application/octet-stream',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate signed upload URL.' });
  }
});

/** POST /api/documents — Save Document Record */
router.post('/', authenticateAdmin, requireAnyAdmin, upload.single('file'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const {
      title, description, unitId, academicYearId, eventId,
      documentType, visibility,
      filePath: directFilePath, storagePath, fileSize: directFileSize, mimeType: directMimeType
    } = req.body;

    if (!title || !unitId || !academicYearId) {
      return res.status(400).json({ success: false, message: 'Title, Chapter (unitId), and Academic Year are required.' });
    }

    if (!canAccessUnit(req.admin, unitId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    let finalFilePath = directFilePath || null;
    let finalFileSize = directFileSize ? Number(directFileSize) : 0;
    let finalMimeType = directMimeType || 'application/octet-stream';

    // Fallback: If uploaded via multipart form
    if (tmpFile) {
      const destination = `documents/${Date.now()}-${path.basename(tmpFile)}`;
      const { publicUrl } = await uploadFile(BUCKETS.DOCUMENTS, tmpFile, destination, req.file.mimetype);
      finalFilePath = publicUrl;
      finalFileSize = req.file.size;
      finalMimeType = req.file.mimetype;
    }

    if (!finalFilePath) {
      return res.status(400).json({ success: false, message: 'File is required.' });
    }

    const { data: doc, error } = await supabase
      .from('documents')
      .insert([{
        title: title.trim(),
        description: description || '',
        unit_id: unitId,
        academic_year_id: academicYearId,
        event_id: eventId || null,
        document_type: documentType || 'Other Documents',
        file_path: finalFilePath,
        file_size: finalFileSize,
        mime_type: finalMimeType,
        visibility: visibility || 'Public',
      }])
      .select('*, units(name, code), academic_years(year)')
      .single();

    if (error) {
      // Clean up orphaned storage file if DB insert failed
      if (storagePath) await deleteFile(BUCKETS.DOCUMENTS, storagePath).catch(() => {});
      else if (finalFilePath) await deleteFile(BUCKETS.DOCUMENTS, finalFilePath).catch(() => {});
      throw error;
    }

    await logAction(req, 'Upload Document', 'Document', doc.id, unitId);
    res.status(201).json({
      success: true,
      data: {
        ...doc,
        _id: doc.id,
        filePath: doc.file_path,
        fileSize: doc.file_size,
        mimeType: doc.mime_type,
        documentType: doc.document_type,
        downloadsCount: doc.downloads_count,
        unitId: doc.unit_id ? { _id: doc.unit_id, id: doc.unit_id, name: doc.units?.name || '', code: doc.units?.code || '' } : null,
        academicYearId: doc.academic_year_id ? { _id: doc.academic_year_id, id: doc.academic_year_id, year: doc.academic_years?.year || '' } : null,
      },
      message: 'Document uploaded successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to save document record.' });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
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

/** PUT /api/documents/:id — Edit Document Metadata & Optional File Replacement */
router.put('/:id', authenticateAdmin, requireAnyAdmin, upload.single('file'), async (req, res) => {
  let tmpFile = req.file ? req.file.path : null;
  try {
    const { data: doc } = await supabase.from('documents').select('*').eq('id', req.params.id).single();
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    if (!canAccessUnit(req.admin, doc.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const {
      title, description, documentType, visibility, unitId, academicYearId,
      filePath: directFilePath, storagePath, fileSize: directFileSize, mimeType: directMimeType
    } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description;
    if (documentType) updates.document_type = documentType;
    if (visibility) updates.visibility = visibility;
    if (unitId) updates.unit_id = unitId;
    if (academicYearId) updates.academic_year_id = academicYearId;

    // Direct uploaded replacement file
    if (directFilePath && directFilePath !== doc.file_path) {
      if (doc.file_path) {
        await deleteFile(BUCKETS.DOCUMENTS, doc.file_path).catch(() => {});
      }
      updates.file_path = directFilePath;
      if (directFileSize) updates.file_size = Number(directFileSize);
      if (directMimeType) updates.mime_type = directMimeType;
    }

    // Multipart replacement file fallback
    if (tmpFile) {
      const publicUrl = await uploadFile(BUCKETS.DOCUMENTS, req.file.path, req.file.originalname, req.file.mimetype);
      if (doc.file_path) {
        await deleteFile(BUCKETS.DOCUMENTS, doc.file_path).catch(() => {});
      }
      updates.file_path = publicUrl;
      updates.file_size = req.file.size;
      updates.mime_type = req.file.mimetype;
    }

    const { data: updated, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', doc.id)
      .select('*, units(name, code), academic_years(year)')
      .single();

    if (error) throw error;

    await logAction(req, 'Edit Document', 'Document', doc.id, doc.unit_id);
    res.json({
      success: true,
      data: {
        ...updated,
        _id: updated.id,
        filePath: updated.file_path,
        fileSize: updated.file_size,
        mimeType: updated.mime_type,
        documentType: updated.document_type,
        downloadsCount: updated.downloads_count,
        unitId: updated.unit_id ? { _id: updated.unit_id, id: updated.unit_id, name: updated.units?.name || '', code: updated.units?.code || '' } : null,
        academicYearId: updated.academic_year_id ? { _id: updated.academic_year_id, id: updated.academic_year_id, year: updated.academic_years?.year || '' } : null,
      },
      message: 'Document updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update document.' });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
});

module.exports = router;
