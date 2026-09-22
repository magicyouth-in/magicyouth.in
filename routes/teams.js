/**
 * routes/teams.js
 * CRUD for Teams and Team Members using Supabase PostgreSQL.
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

// Temp storage for member photo uploads
// Use os.tmpdir() so it works on Vercel serverless (read-only fs except /tmp)
const os = require('os');
const tmpDir = os.tmpdir();
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, tmpDir); },
  filename:    (req, file, cb) => { cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`); },
});
const uploadPhoto = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/heic','image/heif','image/heic-sequence','image/heif-sequence'];
    const allowedExts = /\.(jpeg|jpg|png|webp|gif|heic|heif)$/i;
    if (allowed.includes(file.mimetype) || allowedExts.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF, HEIC) are allowed.'));
  },
});

/** GET /api/teams */
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    let query = supabase.from('teams').select('*, units(name, code), academic_years(year)').order('created_at', { ascending: false });
    if (req.query.unitId) query = query.eq('unit_id', req.query.unitId);
    if (req.query.academicYearId) query = query.eq('academic_year_id', req.query.academicYearId);

    const { data: teams, error } = await query;
    if (error) throw error;

    const formatted = (teams || []).map(t => ({
      ...t,
      _id: t.id,
      unitId: t.unit_id ? { _id: t.unit_id, id: t.unit_id, name: t.units?.name || '', code: t.units?.code || '' } : null,
      academicYearId: t.academic_year_id ? { _id: t.academic_year_id, id: t.academic_year_id, year: t.academic_years?.year || '' } : null,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/teams/:id */
router.get('/:id', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*, units(name, code), academic_years(year)')
      .eq('id', req.params.id)
      .single();

    if (error || !team) return res.status(404).json({ success: false, message: 'Team not found.' });

    const formatted = {
      ...team,
      _id: team.id,
      unitId: team.unit_id ? { _id: team.unit_id, id: team.unit_id, name: team.units?.name || '', code: team.units?.code || '' } : null,
      academicYearId: team.academic_year_id ? { _id: team.academic_year_id, id: team.academic_year_id, year: team.academic_years?.year || '' } : null,
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** GET /api/teams/:id/members */
router.get('/:id/members', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', req.params.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    const formatted = (members || []).map(m => {
      const social = typeof m.social_links === 'string' ? JSON.parse(m.social_links || '{}') : (m.social_links || {});
      const isAnimator = social.section === 'Main Animator' || /^(main\s+)?animator|faculty\s+advisor|mentor/i.test(m.position);
      const canonicalDept = m.department || social.organization || '';
      return {
        ...m,
        _id: m.id,
        teamId: m.team_id,
        batchYear: m.batch_year,
        department: canonicalDept,
        organization: canonicalDept,
        socialLinks: social,
        section: social.section || (isAnimator ? 'Main Animator' : 'Team Member'),
        isActive: m.is_active,
        displayOrder: m.display_order ?? 0,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/teams */
router.post('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { name, unitId, academicYearId, status } = req.body;
    if (!unitId || !academicYearId) return res.status(400).json({ success: false, message: 'unitId and academicYearId are required.' });

    if (!canAccessUnit(req.admin, unitId)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const { data: team, error } = await supabase
      .from('teams')
      .insert([{
        name: name || 'Executive Board',
        unit_id: unitId,
        academic_year_id: academicYearId,
        status: status || 'Active',
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Create Team', 'Team', team.id, unitId);
    res.status(201).json({ success: true, data: { ...team, _id: team.id }, message: 'Team created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/teams/:id */
router.put('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: team } = await supabase.from('teams').select('*').eq('id', req.params.id).single();
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const updates = { updated_at: new Date().toISOString() };
    if (req.body.name) updates.name = req.body.name;
    if (req.body.status) updates.status = req.body.status;

    const { data: updated, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Edit Team', 'Team', updated.id, team.unit_id);
    res.json({ success: true, data: { ...updated, _id: updated.id }, message: 'Team updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/teams/:id/members */
router.post('/:id/members', authenticateAdmin, requireAnyAdmin, uploadPhoto.single('photo'), async (req, res) => {
  const tmpFile = req.file ? req.file.path : null;
  try {
    const { data: team } = await supabase.from('teams').select('*').eq('id', req.params.id).single();
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    if (!canAccessUnit(req.admin, team.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const { name, position, biography, department, batchYear, socialLinks, displayOrder, isActive, section, organization } = req.body;
    if (!name || !position) return res.status(400).json({ success: false, message: 'Name and position are required.' });

    const deptValue = (department !== undefined ? department : organization) || '';

    // Upload photo to Supabase Storage if provided
    let photoUrl = null;
    if (tmpFile) {
      const dest = `team-photos/${Date.now()}-${path.basename(tmpFile)}`;
      const { publicUrl } = await uploadFile(BUCKETS.GALLERY, tmpFile, dest, req.file.mimetype);
      photoUrl = publicUrl;
    }

    let parsedSocial = socialLinks ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) : {};
    if (section) parsedSocial.section = section;
    parsedSocial.organization = deptValue;

    const { data: member, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        name,
        position,
        biography: biography || '',
        department: deptValue,
        batch_year: batchYear || '',
        photo: photoUrl,
        social_links: parsedSocial,
        display_order: displayOrder ? parseInt(displayOrder, 10) : 0,
        is_active: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req, 'Create Team Member', 'TeamMember', member.id, team.unit_id);
    res.status(201).json({ 
      success: true, 
      data: { 
        ...member, 
        _id: member.id, 
        teamId: member.team_id, 
        photo: member.photo,
        department: member.department,
        organization: member.department,
        section: parsedSocial.section || 'Team Member',
      }, 
      message: 'Team member added.' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

/** PUT /api/teams/members/:memberId — Edit Team Member */
router.put('/members/:memberId', authenticateAdmin, requireAnyAdmin, uploadPhoto.single('photo'), async (req, res) => {
  const tmpFile = req.file ? req.file.path : null;
  try {
    const { data: member } = await supabase.from('team_members').select('*').eq('id', req.params.memberId).single();
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    const { data: team } = await supabase.from('teams').select('*').eq('id', member.team_id).single();
    if (team && !canAccessUnit(req.admin, team.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const { name, position, biography, department, batchYear, socialLinks, displayOrder, isActive, section, organization } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (name) updates.name = name;
    if (position) updates.position = position;
    if (biography !== undefined) updates.biography = biography;
    
    const deptValue = department !== undefined ? department : organization;
    if (deptValue !== undefined) updates.department = deptValue;

    if (batchYear !== undefined) updates.batch_year = batchYear;
    if (displayOrder !== undefined) updates.display_order = parseInt(displayOrder, 10);
    if (isActive !== undefined) updates.is_active = isActive === 'true' || isActive === true;
    
    let existingSocial = typeof member.social_links === 'string' ? JSON.parse(member.social_links || '{}') : (member.social_links || {});
    let parsedSocial = socialLinks ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) : { ...existingSocial };
    if (section !== undefined) parsedSocial.section = section;
    if (deptValue !== undefined) parsedSocial.organization = deptValue;
    updates.social_links = parsedSocial;

    if (tmpFile) {
      const dest = `team-photos/${Date.now()}-${path.basename(tmpFile)}`;
      const { publicUrl } = await uploadFile(BUCKETS.GALLERY, tmpFile, dest, req.file.mimetype);
      updates.photo = publicUrl;
    }

    const { data: updated, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', member.id)
      .select()
      .single();

    if (error) throw error;

    if (team) await logAction(req, 'Edit Team Member', 'TeamMember', member.id, team.unit_id);
    res.json({ 
      success: true, 
      data: { 
        ...updated, 
        _id: updated.id, 
        teamId: updated.team_id, 
        photo: updated.photo,
        department: updated.department,
        organization: updated.department,
        section: parsedSocial.section || 'Team Member',
      }, 
      message: 'Member updated.' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

/** PATCH /api/teams/members/reorder — Reorder members persistently */
router.patch('/members/reorder', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { items, order } = req.body;
    const list = items || order;
    if (!Array.isArray(list)) {
      return res.status(400).json({ success: false, message: 'Array of items or order is required.' });
    }

    const updates = list.map((item, index) => {
      const id = typeof item === 'object' ? (item._id || item.id) : item;
      const displayOrder = typeof item === 'object' && item.displayOrder !== undefined ? item.displayOrder : index;
      return supabase
        .from('team_members')
        .update({ display_order: displayOrder, updated_at: new Date().toISOString() })
        .eq('id', id);
    });

    await Promise.all(updates);
    res.json({ success: true, message: 'Display order saved to database.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/teams/members/:memberId */
router.delete('/members/:memberId', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: member } = await supabase.from('team_members').select('*').eq('id', req.params.memberId).single();
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    const { data: team } = await supabase.from('teams').select('*').eq('id', member.team_id).single();
    if (team && !canAccessUnit(req.admin, team.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    await supabase.from('team_members').delete().eq('id', member.id);
    if (team) await logAction(req, 'Delete Team Member', 'TeamMember', member.id, team.unit_id);

    res.json({ success: true, message: 'Member deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

