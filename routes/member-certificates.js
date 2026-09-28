/**
 * routes/member-certificates.js
 * Admin issues digital certificates to members.
 * Members can view and download their own certificates.
 */

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const os       = require('os');
const supabase = require('../utils/supabaseClient');
const { BUCKETS, uploadFile } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { authenticateMember } = require('../middleware/memberAuth');

const tmpDir = os.tmpdir();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, tmpDir),
    filename:    (req, file, cb) => cb(null, `${Date.now()}-cert${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ─── MEMBER: MY CERTIFICATES ──────────────────────────────────────────────────

router.get('/my', authenticateMember, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('member_certificates')
      .select('id, title, description, file_url, issued_at, events(title)')
      .eq('member_id', req.member.id)
      .order('issued_at', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map(c => ({
      id:          c.id,
      title:       c.title,
      description: c.description,
      fileUrl:     c.file_url,
      issuedAt:    c.issued_at,
      eventTitle:  c.events?.title || '',
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN: ISSUE CERTIFICATE ────────────────────────────────────────────────

router.post('/', authenticateAdmin, requireAnyAdmin, upload.single('certificate'), async (req, res) => {
  let tmpFile = req.file?.path || null;
  try {
    const { memberId, title, description, eventId } = req.body;
    if (!memberId || !title) {
      return res.status(400).json({ success: false, message: 'memberId and title are required.' });
    }

    const { data: member } = await supabase.from('members').select('id, name, unit_id').eq('id', memberId).single();
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (!canAccessUnit(req.admin, member.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    let fileUrl = null;
    if (tmpFile) {
      const dest = `certificates/${Date.now()}-${path.basename(tmpFile)}`;
      const bucket = BUCKETS.DOCUMENTS || BUCKETS.EVENTS || 'gallery';
      const { publicUrl } = await uploadFile(bucket, tmpFile, dest, req.file.mimetype);
      fileUrl = publicUrl;
    }

    const { data, error } = await supabase
      .from('member_certificates')
      .insert([{
        member_id:   memberId,
        unit_id:     member.unit_id,
        event_id:    eventId || null,
        title,
        description: description || '',
        file_url:    fileUrl,
        issued_by:   req.admin.id,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data, message: `Certificate issued to ${member.name}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

// ─── ADMIN: LIST CERTIFICATES ────────────────────────────────────────────────

router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let query = supabase
      .from('member_certificates')
      .select('*, members(name, member_id, unit_id), events(title)', { count: 'exact' })
      .order('issued_at', { ascending: false });

    if (req.admin.role === 'SUB_ADMIN' && req.admin.assigned_unit_ids?.length > 0) {
      query = query.in('unit_id', req.admin.assigned_unit_ids);
    }
    if (req.query.memberId) query = query.eq('member_id', req.query.memberId);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [], total: count || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN: DELETE ────────────────────────────────────────────────────────────

router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: cert } = await supabase.from('member_certificates').select('unit_id').eq('id', req.params.id).single();
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    if (!canAccessUnit(req.admin, cert.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    await supabase.from('member_certificates').delete().eq('id', req.params.id);
    res.json({ success: true, message: 'Certificate deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
