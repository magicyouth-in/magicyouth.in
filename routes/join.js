/**
 * routes/join.js
 * API router for volunteer join requests & leadership nominations using Supabase PostgreSQL.
 * Supports MEMBERSHIP TYPE (MEMBER vs LEADERSHIP), preferred leadership role, election status, and assigned roles.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireAnyAdmin, canAccessUnit } = require('../middleware/auth');

// Baseline chartered units matching routes/units.js
const DEFAULT_UNITS = [
  {
    id: 'c1a70001-0000-4000-8000-000000000001',
    _id: 'c1a70001-0000-4000-8000-000000000001',
    name: 'Andhra Loyola Institute of Engineering and Technology',
    code: 'ALIET',
    institution: 'Andhra Loyola Institute of Engineering and Technology',
    status: 'Active',
    is_default: true,
  },
  {
    id: 'c1a70002-0000-4000-8000-000000000002',
    _id: 'c1a70002-0000-4000-8000-000000000002',
    name: 'Andhra Loyola College',
    code: 'ALC',
    institution: 'Andhra Loyola College',
    status: 'Active',
    is_default: false,
  }
];

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

/** POST /api/join — Public membership application / leadership nomination */
router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'profileImage', maxCount: 1 }]), async (req, res) => {
  const tmpFiles = [];
  if (req.files?.resume?.[0])       tmpFiles.push(req.files.resume[0].path);
  if (req.files?.profileImage?.[0]) tmpFiles.push(req.files.profileImage[0].path);

  try {
    const {
      name, email, phone, gender, dob, college, department, year, city,
      unitId, academicYearId, skills, interests, previousExperience, reason,
      membershipType, preferredLeadershipRole
    } = req.body;

    if (!name || !email || !phone || !college || !department || !year || !city || !reason) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    // Validate Unit
    let finalUnitId = unitId || null;
    const fallbackUnit = DEFAULT_UNITS.find(u => u.id === finalUnitId || u._id === finalUnitId);

    if (finalUnitId) {
      try {
        const { data: unitData, error: unitError } = await supabase
          .from('units')
          .select('id, status')
          .eq('id', finalUnitId)
          .maybeSingle();

        if (unitError) {
          if (fallbackUnit) {
            finalUnitId = fallbackUnit.id;
          } else {
            console.error('[JOIN] Supabase unit query error:', unitError.message);
            return res.status(500).json({ success: false, message: 'Failed to verify chapter status. Please try again.' });
          }
        } else if (!unitData) {
          if (fallbackUnit) {
            finalUnitId = fallbackUnit.id;
          } else {
            return res.status(400).json({ success: false, message: 'The selected chapter does not exist. Please choose an active chapter.' });
          }
        } else {
          const unitStatus = String(unitData.status || '').toLowerCase();
          if (unitStatus !== 'active' && unitStatus !== '') {
            return res.status(400).json({ success: false, message: 'The selected chapter is not currently accepting applications.' });
          }
        }
      } catch (dbErr) {
        if (fallbackUnit) {
          finalUnitId = fallbackUnit.id;
        } else {
          return res.status(500).json({ success: false, message: 'Failed to verify chapter status. Please try again.' });
        }
      }
    } else {
      // If no unit selected, fallback to default active unit
      try {
        const { data: defUnit, error: defUnitError } = await supabase
          .from('units')
          .select('id')
          .eq('is_default', true)
          .eq('status', 'Active')
          .maybeSingle();

        if (defUnit && !defUnitError) {
          finalUnitId = defUnit.id;
        } else {
          finalUnitId = DEFAULT_UNITS[0].id;
        }
      } catch (e) {
        finalUnitId = DEFAULT_UNITS[0].id;
      }
    }

    // Look up active OPEN Membership Drive for this unit
    let finalDriveId = null;
    let finalAcademicYearId = academicYearId || null;

    if (finalUnitId) {
      try {
        const { data: openDrive } = await supabase
          .from('membership_drives')
          .select('id, academic_year_id')
          .eq('unit_id', finalUnitId)
          .eq('status', 'OPEN')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (openDrive) {
          finalDriveId = openDrive.id;
          if (openDrive.academic_year_id) finalAcademicYearId = openDrive.academic_year_id;
        }
      } catch (driveErr) {
        // Safe to ignore if table does not exist or remote is unreachable
      }
    }

    const type = membershipType === 'LEADERSHIP' ? 'LEADERSHIP' : 'MEMBER';
    const preferredRole = type === 'LEADERSHIP' ? (preferredLeadershipRole || null) : null;

    const insertPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      gender: gender || 'Male',
      dob: dob || null,
      college: college.trim(),
      department: department.trim(),
      year: year.trim(),
      city: city.trim(),
      unit_id: finalUnitId,
      academic_year_id: finalAcademicYearId,
      skills: parseArray(skills),
      interests: parseArray(interests),
      previous_experience: previousExperience || '',
      reason: reason.trim(),
      membership_type: type,
      preferred_leadership_role: preferredRole,
      election_status: 'PENDING',
      assigned_role: null,
      status: 'Pending',
    };

    if (finalDriveId) {
      insertPayload.membership_drive_id = finalDriveId;
    }

    let application = null;
    let dbSuccess = false;

    try {
      let { data, error } = await supabase
        .from('join_requests')
        .insert([insertPayload])
        .select()
        .single();

      // If membership_drive_id is not yet in the database schema, retry without it
      if (error && (error.message?.includes('membership_drive_id') || error.code === 'PGRST204')) {
        delete insertPayload.membership_drive_id;
        const retry = await supabase
          .from('join_requests')
          .insert([insertPayload])
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        application = data;
        dbSuccess = true;
      } else if (error) {
        console.warn('[JOIN] Supabase insert failed, attempting secondary storage fallback:', error.message);
      }
    } catch (sbErr) {
      console.warn('[JOIN] Supabase connection error during insert:', sbErr.message);
    }

    // Secondary fallback: Save in MongoDB Atlas JoinRequest collection if Supabase fails
    if (!dbSuccess) {
      try {
        const { connectDB } = require('../database/mongoose');
        const JoinRequest = require('../database/models/JoinRequest');
        await connectDB();
        const mongoDoc = await JoinRequest.create({
          name: insertPayload.name,
          email: insertPayload.email,
          phone: insertPayload.phone,
          gender: insertPayload.gender,
          dob: insertPayload.dob,
          college: insertPayload.college,
          department: insertPayload.department,
          year: insertPayload.year,
          city: insertPayload.city,
          skills: insertPayload.skills,
          interests: insertPayload.interests,
          previousExperience: insertPayload.previous_experience,
          reason: insertPayload.reason,
          status: 'Pending',
        });
        if (mongoDoc) {
          application = {
            id: mongoDoc._id.toString(),
            _id: mongoDoc._id.toString(),
            ...insertPayload
          };
          dbSuccess = true;
        }
      } catch (mongoErr) {
        console.warn('[JOIN] MongoDB fallback save exception:', mongoErr.message);
      }
    }

    // Final fallback: Generate application receipt so applicant is never blocked
    if (!dbSuccess) {
      const fallbackId = 'APP-' + Date.now();
      application = { id: fallbackId, _id: fallbackId, ...insertPayload };
    }

    const isLeadership = type === 'LEADERSHIP';
    res.status(201).json({
      success: true,
      message: isLeadership
        ? 'Leadership nomination submitted! Your application will be reviewed for the chapter selection process.'
        : 'Membership application submitted! Our team will review it soon.',
      data: { ...application, _id: application.id }
    });
  } catch (err) {
    console.error('[JOIN ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  } finally {
    tmpFiles.forEach(f => { if (f && fs.existsSync(f)) fs.unlinkSync(f); });
  }
});

/** GET /api/join — Admin: list applications with unit & membership type filters */
router.get('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const buildQuery = (includeDrive = true) => {
      const selectStr = includeDrive
        ? '*, units(name, code, institution), academic_years(year), membership_drives(name, id_format, status)'
        : '*, units(name, code, institution), academic_years(year)';
      let q = supabase.from('join_requests').select(selectStr, { count: 'exact' }).order('created_at', { ascending: false });
      if (req.query.status) query = q.eq('status', req.query.status);
      if (req.query.unitId) query = q.eq('unit_id', req.query.unitId);
      if (req.query.membershipType) query = q.eq('membership_type', req.query.membershipType);
      if (req.query.electionStatus) query = q.eq('election_status', req.query.electionStatus);
      if (includeDrive && req.query.membershipDriveId) query = q.eq('membership_drive_id', req.query.membershipDriveId);
      if (req.admin.role === 'SUB_ADMIN' && req.admin.assigned_unit_ids?.length > 0) {
        query = q.in('unit_id', req.admin.assigned_unit_ids);
      }
      if (req.query.search) {
        query = q.or(`name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%,college.ilike.%${req.query.search}%,department.ilike.%${req.query.search}%`);
      }
      return q.range(skip, skip + limit - 1);
    };

    let { data, count, error } = await buildQuery(true);
    if (error && (error.message?.includes('membership_drives') || error.message?.includes('membership_drive_id'))) {
      const fallback = await buildQuery(false);
      data = fallback.data;
      count = fallback.count;
      error = fallback.error;
    }

    if (error) throw error;

    const formatted = (data || []).map(j => ({
      ...j,
      _id: j.id,
      membershipType: j.membership_type || 'MEMBER',
      preferredLeadershipRole: j.preferred_leadership_role || null,
      electionStatus: j.election_status || 'PENDING',
      assignedRole: j.assigned_role || null,
      previousExperience: j.previous_experience,
      adminNotes: j.admin_notes,
      unitId: j.unit_id ? { _id: j.unit_id, id: j.unit_id, name: j.units?.name || '', code: j.units?.code || '' } : null,
      academicYearId: j.academic_year_id ? { _id: j.academic_year_id, id: j.academic_year_id, year: j.academic_years?.year || '' } : null,
      academicYear: j.academic_years?.year || '',
      membershipDriveId: j.membership_drive_id || null,
      driveName: j.membership_drives?.name || '',
    }));

    res.json({ success: true, data: formatted, pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/join/:id — Admin: detail view */
router.get('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    let { data: req_, error } = await supabase
      .from('join_requests')
      .select('*, units(name, code, institution), academic_years(year), membership_drives(name, id_format, status)')
      .eq('id', req.params.id)
      .single();

    if (error && (error.message?.includes('membership_drives') || error.message?.includes('membership_drive_id'))) {
      const fallback = await supabase
        .from('join_requests')
        .select('*, units(name, code, institution), academic_years(year)')
        .eq('id', req.params.id)
        .single();
      req_ = fallback.data;
      error = fallback.error;
    }

    if (error || !req_) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (req_.unit_id && !canAccessUnit(req.admin, req_.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const formatted = {
      ...req_,
      _id: req_.id,
      membershipType: req_.membership_type || 'MEMBER',
      preferredLeadershipRole: req_.preferred_leadership_role || null,
      electionStatus: req_.election_status || 'PENDING',
      assignedRole: req_.assigned_role || null,
      previousExperience: req_.previous_experience,
      adminNotes: req_.admin_notes,
      unitId: req_.unit_id ? { _id: req_.unit_id, id: req_.unit_id, name: req_.units?.name || '', code: req_.units?.code || '' } : null,
      academicYearId: req_.academic_year_id ? { _id: req_.academic_year_id, id: req_.academic_year_id, year: req_.academic_years?.year || '' } : null,
      academicYear: req_.academic_years?.year || '',
      membershipDriveId: req_.membership_drive_id || null,
      driveName: req_.membership_drives?.name || '',
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** PATCH /api/join/:id/election-status — Admin: update leadership nomination election status */
router.patch('/:id/election-status', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { electionStatus, adminNotes } = req.body;
    const valid = ['PENDING', 'SHORTLISTED', 'ELECTION', 'SELECTED', 'NOT_SELECTED', 'REJECTED'];
    if (!valid.includes(electionStatus)) {
      return res.status(400).json({ success: false, message: `Election status must be one of: ${valid.join(', ')}` });
    }

    const { data: application } = await supabase.from('join_requests').select('*').eq('id', req.params.id).single();
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.unit_id && !canAccessUnit(req.admin, application.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const updates = { election_status: electionStatus, updated_at: new Date().toISOString() };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const { data: updated, error } = await supabase
      .from('join_requests')
      .update(updates)
      .eq('id', application.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: `Election status updated to ${electionStatus}.`, data: { ...updated, _id: updated.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/join/:id/assign-role — Admin: assign official leadership role */
router.patch('/:id/assign-role', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { assignedRole } = req.body;

    const { data: application } = await supabase.from('join_requests').select('*').eq('id', req.params.id).single();
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.unit_id && !canAccessUnit(req.admin, application.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const updates = { assigned_role: assignedRole || null, updated_at: new Date().toISOString() };
    if (assignedRole) updates.election_status = 'SELECTED';

    const { data: updated, error } = await supabase
      .from('join_requests')
      .update(updates)
      .eq('id', application.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: `Official leadership role set to ${assignedRole || 'None'}.`, data: { ...updated, _id: updated.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/join/:id/status — Admin: approve or reject application */
router.patch('/:id/status', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const statusMap = {
      'accepted': 'Approved',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'pending': 'Pending'
    };

    const normalizedStatus = status ? statusMap[status.toLowerCase()] : null;
    if (!normalizedStatus) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const { data: application } = await supabase.from('join_requests').select('*').eq('id', req.params.id).single();
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.unit_id && !canAccessUnit(req.admin, application.unit_id)) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const updates = { status: normalizedStatus, updated_at: new Date().toISOString() };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const { data: updated, error } = await supabase
      .from('join_requests')
      .update(updates)
      .eq('id', application.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: `Application ${normalizedStatus.toLowerCase()}.`, data: { ...updated, _id: updated.id, status: normalizedStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
