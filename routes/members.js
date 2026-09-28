/**
 * routes/members.js
 * Member Portal — member management, approval workflow, profile, E-Card.
 *
 * Admin endpoints: /api/members/*          (require admin auth)
 * Member endpoints: /api/members/me/*      (require member auth)
 * Public endpoints: /api/members/verify/:memberId
 */

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const os       = require('os');
const supabase = require('../utils/supabaseClient');
const { BUCKETS, uploadFile } = require('../utils/supabaseStorage');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');
const { authenticateMember } = require('../middleware/memberAuth');

const tmpDir = os.tmpdir();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * Generate a unique Member ID: MAGIC-{UNIT_CODE}-{0001}
 * Uses member_id_sequences table for atomicity, falls back to count if needed.
 */
async function generateMemberId(unitCode) {
  const code = (unitCode || 'GEN').toUpperCase().replace(/[^A-Z0-9]/g, '');

  try {
    const { data, error } = await supabase.rpc('increment_member_seq', { p_unit_code: code });
    if (!error && data) {
      return `MAGIC-${code}-${String(data).padStart(4, '0')}`;
    }
  } catch (e) {
    // Fallback to table count
  }

  const { count } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .like('member_id', `MAGIC-${code}-%`);

  return `MAGIC-${code}-${String((count || 0) + 1).padStart(4, '0')}`;
}

async function uploadProfilePhoto(file) {
  if (!file) return null;
  try {
    const dest = `members/${Date.now()}-${path.basename(file.path)}`;
    const { publicUrl } = await uploadFile(BUCKETS.GALLERY || 'gallery', file.path, dest, file.mimetype);
    return publicUrl;
  } catch {
    return null;
  } finally {
    if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
  }
}

function mapMember(m) {
  return {
    ...m,
    _id:                     m.id,
    memberId:                m.member_id,
    unitId:                  m.unit_id,
    academicYearId:          m.academic_year_id,
    profilePhoto:            m.profile_photo,
    membershipType:          m.membership_type || 'MEMBER',
    preferredLeadershipRole: m.preferred_leadership_role || null,
    electionStatus:          m.election_status || 'PENDING',
    assignedRole:            m.assigned_role || null,
    roleLabel:               m.assigned_role || m.role_label || 'Member',
    joinRequestId:           m.join_request_id,
    validUntil:              m.valid_until,
    joinedAt:                m.joined_at,
    lastLoginAt:             m.last_login_at,
    unitName:                m.units?.name || '',
    unitCode:                m.units?.code || '',
    academicYear:            m.academic_years?.year || '',
  };
}

// ─── PUBLIC — VERIFY MEMBER ────────────────────────────────────────────────────

/**
 * GET /api/members/verify/:memberId
 * Public membership verification. Returns ONLY safe, public fields.
 */
router.get('/verify/:memberId', async (req, res) => {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('member_id, name, status, role_label, assigned_role, membership_type, joined_at, valid_until, unit_id, units(name)')
      .eq('member_id', req.params.memberId.toUpperCase())
      .single();

    if (error || !member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    return res.json({
      success: true,
      data: {
        memberId:       member.member_id,
        name:           member.name,
        status:         member.status,
        membershipType: member.membership_type || 'MEMBER',
        roleLabel:      member.assigned_role || member.role_label || 'Member',
        unitName:       member.units?.name || '',
        joinedAt:       member.joined_at,
        validUntil:     member.valid_until,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── MEMBER SELF — /api/members/me ────────────────────────────────────────────

/**
 * GET /api/members/me
 * Member's own profile.
 */
router.get('/me', authenticateMember, async (req, res) => {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('*, units(name, code, institution, location), academic_years(year)')
      .eq('id', req.member.id)
      .single();

    if (error || !member) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const safe = mapMember(member);
    delete safe.password_hash;

    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/members/me
 * Member can update permitted fields only.
 */
router.patch('/me', authenticateMember, upload.single('profilePhoto'), async (req, res) => {
  try {
    const allowed = ['bio', 'interests', 'skills', 'address'];
    const updates = { updated_at: new Date().toISOString() };

    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    if (req.file) {
      const photoUrl = await uploadProfilePhoto(req.file);
      if (photoUrl) updates.profile_photo = photoUrl;
    }

    const { data: updated, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', req.member.id)
      .select()
      .single();

    if (error) throw error;

    const safe = mapMember(updated);
    delete safe.password_hash;
    res.json({ success: true, data: safe, message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN — APPROVE JOIN REQUEST ─────────────────────────────────────────────

/**
 * POST /api/members/approve/:joinRequestId
 * Admin approves a join_request and creates a member account.
 * Supports leadership nominations with optional assigned role.
 */
router.post('/approve/:joinRequestId', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { assignedRole, electionStatus } = req.body;

    const { data: application, error: appError } = await supabase
      .from('join_requests')
      .select('*, units(name, code), academic_years(year)')
      .eq('id', req.params.joinRequestId)
      .single();

    if (appError || !application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.unit_id && !canAccessUnit(req.admin, application.unit_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    if (application.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Application already approved.' });
    }

    // Generate Member ID based on unit code
    const unitCode = application.units?.code || 'GEN';
    const memberId = await generateMemberId(unitCode);

    // Generate temporary password
    const tempPassword = `MAGIC@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const memType = application.membership_type || 'MEMBER';
    const finalAssignedRole = assignedRole || application.assigned_role || null;
    const finalRoleLabel = finalAssignedRole || 'Member';
    const finalElectionStatus = electionStatus || (finalAssignedRole ? 'SELECTED' : application.election_status || 'PENDING');

    // Create member account
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert([{
        member_id:                 memberId,
        join_request_id:           application.id,
        unit_id:                   application.unit_id,
        academic_year_id:          application.academic_year_id,
        name:                      application.name,
        email:                     application.email,
        phone:                     application.phone,
        gender:                    application.gender,
        dob:                       application.dob,
        college:                   application.college,
        department:                application.department,
        year:                      application.year,
        city:                      application.city,
        interests:                 application.interests || [],
        skills:                    application.skills || [],
        profile_photo:             null,
        password_hash:             passwordHash,
        status:                    'Active',
        membership_type:           memType,
        preferred_leadership_role: application.preferred_leadership_role || null,
        election_status:           finalElectionStatus,
        assigned_role:             finalAssignedRole,
        role_label:                finalRoleLabel,
      }])
      .select()
      .single();

    if (memberError) throw memberError;

    // Update join_request status to Approved and store assigned role
    const joinUpdates = {
      status: 'Approved',
      updated_at: new Date().toISOString(),
    };
    if (finalAssignedRole) {
      joinUpdates.assigned_role = finalAssignedRole;
      joinUpdates.election_status = finalElectionStatus;
    }

    await supabase
      .from('join_requests')
      .update(joinUpdates)
      .eq('id', application.id);

    return res.status(201).json({
      success: true,
      message: `Member account created successfully! Member ID: ${memberId}`,
      data: {
        memberId,
        tempPassword,  // Show ONCE to admin
        memberDbId: member.id,
        assignedRole: finalAssignedRole,
        roleLabel: finalRoleLabel,
      },
    });
  } catch (err) {
    console.error('[APPROVE MEMBER ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN — LIST MEMBERS ─────────────────────────────────────────────────────

/**
 * GET /api/members
 * Admin: list all members with filters.
 */
router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let query = supabase
      .from('members')
      .select('id, member_id, name, email, phone, college, department, year, status, membership_type, preferred_leadership_role, election_status, assigned_role, role_label, profile_photo, joined_at, unit_id, units(name, code), academic_years(year)', { count: 'exact' })
      .order('joined_at', { ascending: false });

    // Unit isolation
    if (req.admin.role === 'SUB_ADMIN' && req.admin.assigned_unit_ids?.length > 0) {
      query = query.in('unit_id', req.admin.assigned_unit_ids);
    }

    if (req.query.unitId)         query = query.eq('unit_id', req.query.unitId);
    if (req.query.status)         query = query.eq('status', req.query.status);
    if (req.query.membershipType) query = query.eq('membership_type', req.query.membershipType);
    if (req.query.year)           query = query.eq('year', req.query.year);
    if (req.query.search) {
      query = query.or(`name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%,member_id.ilike.%${req.query.search}%,college.ilike.%${req.query.search}%`);
    }

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    query = query.range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map(mapMember),
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/members/:id
 * Admin: get member detail.
 */
router.get('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('*, units(name, code, institution), academic_years(year)')
      .eq('id', req.params.id)
      .single();

    if (error || !member) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (!canAccessUnit(req.admin, member.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const safe = mapMember(member);
    delete safe.password_hash;
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/members/:id/role — Admin: update assigned official role
 */
router.patch('/:id/role', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { assignedRole, membershipType } = req.body;

    const { data: existing } = await supabase.from('members').select('unit_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (!canAccessUnit(req.admin, existing.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const updates = {
      assigned_role: assignedRole || null,
      role_label: assignedRole || 'Member',
      updated_at: new Date().toISOString()
    };
    if (membershipType) updates.membership_type = membershipType;

    const { data: updated, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: `Member role updated to ${assignedRole || 'Member'}.`, data: mapMember(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/members/:id/status
 * Admin: change member status (Active/Suspended/Expired/Deactivated).
 */
router.patch('/:id/status', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Active', 'Suspended', 'Expired', 'Deactivated'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
    }

    const { data: existing } = await supabase.from('members').select('unit_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (!canAccessUnit(req.admin, existing.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const { data: updated, error } = await supabase
      .from('members')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: `Member status updated to ${status}.`, data: mapMember(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/members/:id/reset-password
 * Admin: reset member password, returns temp password.
 */
router.post('/:id/reset-password', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('members').select('unit_id, name').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (!canAccessUnit(req.admin, existing.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const tempPassword = `MAGIC@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await supabase
      .from('members')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    res.json({ success: true, message: 'Password reset successfully.', tempPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
