/**
 * scripts/migrate-mongo-to-supabase.js
 * Safely migrates all data from MongoDB Atlas to Supabase PostgreSQL.
 * Preserves exact primary keys, foreign keys, timestamps, and relations.
 */

require('dotenv').config();
const { connectDB } = require('../database/mongoose');
const supabase = require('../utils/supabaseClient');

const AdminUser = require('../database/models/AdminUser');
const Unit = require('../database/models/Unit');
const AcademicYear = require('../database/models/AcademicYear');
const Team = require('../database/models/Team');
const TeamMember = require('../database/models/TeamMember');
const Event = require('../database/models/Event');
const Gallery = require('../database/models/Gallery');
const Document = require('../database/models/Document');
const JoinRequest = require('../database/models/JoinRequest');
const ContactMessage = require('../database/models/ContactMessage');
const AdminActivityLog = require('../database/models/AdminActivityLog');

function mongoIdToUuid(mongoId) {
  if (!mongoId) return null;
  const str = mongoId.toString().replace(/[^0-9a-fA-F]/g, '');
  if (str.length !== 24) return null;
  const padded = str.padStart(32, '0');
  return `${padded.slice(0,8)}-${padded.slice(8,12)}-${padded.slice(12,16)}-${padded.slice(16,20)}-${padded.slice(20,32)}`;
}

async function migrateData() {
  console.log('=== MONGODB ATLAS TO SUPABASE POSTGRESQL DATA MIGRATION ===\n');

  console.log('Connecting to MongoDB Atlas...');
  await connectDB();

  const report = {};

  // 1. Migrate Units
  const mongoUnits = await Unit.find().lean();
  report.Unit = { mongoCount: mongoUnits.length, migrated: 0, failed: 0 };
  for (const u of mongoUnits) {
    const id = mongoIdToUuid(u._id);
    const { error } = await supabase.from('units').upsert({
      id,
      name: u.name,
      code: u.code,
      institution: u.institution || '',
      location: u.location || '',
      description: u.description || '',
      logo: u.logo || null,
      status: u.status || 'Active',
      created_at: u.createdAt || new Date(),
      updated_at: u.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[Unit Error] ${u.name}:`, error.message);
      report.Unit.failed++;
    } else {
      report.Unit.migrated++;
    }
  }

  // 2. Migrate AdminUsers
  const mongoAdmins = await AdminUser.find().lean();
  report.AdminUser = { mongoCount: mongoAdmins.length, migrated: 0, failed: 0 };
  for (const a of mongoAdmins) {
    const id = mongoIdToUuid(a._id);
    const assignedUnits = (a.assignedUnitIds || []).map(mongoIdToUuid).filter(Boolean);
    const { error } = await supabase.from('admin_users').upsert({
      id,
      name: a.name,
      email: a.email,
      password_hash: a.passwordHash,
      role: a.role || 'MAIN_ADMIN',
      assigned_unit_ids: assignedUnits,
      status: a.status || 'Active',
      last_login_at: a.lastLogin || null,
      created_at: a.createdAt || new Date(),
      updated_at: a.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[AdminUser Error] ${a.email}:`, error.message);
      report.AdminUser.failed++;
    } else {
      report.AdminUser.migrated++;
    }
  }

  // 3. Migrate AcademicYears
  const mongoAYs = await AcademicYear.find().lean();
  report.AcademicYear = { mongoCount: mongoAYs.length, migrated: 0, failed: 0 };
  for (const ay of mongoAYs) {
    const id = mongoIdToUuid(ay._id);
    const unit_id = mongoIdToUuid(ay.unitId);
    const { error } = await supabase.from('academic_years').upsert({
      id,
      unit_id,
      year: ay.year,
      status: ay.status || 'Active',
      created_at: ay.createdAt || new Date(),
      updated_at: ay.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[AcademicYear Error] ${ay.year}:`, error.message);
      report.AcademicYear.failed++;
    } else {
      report.AcademicYear.migrated++;
    }
  }

  // 4. Migrate Teams
  const mongoTeams = await Team.find().lean();
  report.Team = { mongoCount: mongoTeams.length, migrated: 0, failed: 0 };
  for (const t of mongoTeams) {
    const id = mongoIdToUuid(t._id);
    const unit_id = mongoIdToUuid(t.unitId);
    const academic_year_id = mongoIdToUuid(t.academicYearId);
    const { error } = await supabase.from('teams').upsert({
      id,
      unit_id,
      academic_year_id,
      name: t.name || 'Executive Board',
      status: t.status || 'Active',
      created_at: t.createdAt || new Date(),
      updated_at: t.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[Team Error] ${t.name}:`, error.message);
      report.Team.failed++;
    } else {
      report.Team.migrated++;
    }
  }

  // 5. Migrate TeamMembers
  const mongoMembers = await TeamMember.find().lean();
  report.TeamMember = { mongoCount: mongoMembers.length, migrated: 0, failed: 0 };
  for (const m of mongoMembers) {
    const id = mongoIdToUuid(m._id);
    const team_id = mongoIdToUuid(m.teamId);
    const { error } = await supabase.from('team_members').upsert({
      id,
      team_id,
      name: m.name,
      position: m.position,
      biography: m.biography || '',
      photo: m.photo || null,
      department: m.department || '',
      batch_year: m.batchYear || '',
      social_links: m.socialLinks || {},
      display_order: m.displayOrder || 0,
      is_active: m.isActive !== false,
      created_at: m.createdAt || new Date(),
      updated_at: m.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[TeamMember Error] ${m.name}:`, error.message);
      report.TeamMember.failed++;
    } else {
      report.TeamMember.migrated++;
    }
  }

  // 6. Migrate Events
  const mongoEvents = await Event.find().lean();
  const defaultUnit = mongoUnits[0] ? mongoIdToUuid(mongoUnits[0]._id) : null;
  const defaultAY = mongoAYs[0] ? mongoIdToUuid(mongoAYs[0]._id) : null;

  report.Event = { mongoCount: mongoEvents.length, migrated: 0, failed: 0 };
  for (const e of mongoEvents) {
    const id = mongoIdToUuid(e._id);
    const unit_id = mongoIdToUuid(e.unitId) || defaultUnit;
    const academic_year_id = mongoIdToUuid(e.academicYearId) || defaultAY;
    const { error } = await supabase.from('events').upsert({
      id,
      unit_id,
      academic_year_id,
      title: e.title,
      description: e.description || '',
      category: e.category || 'Other',
      status: e.status || 'Upcoming',
      date: e.date || null,
      start_time: e.startTime || null,
      end_time: e.endTime || null,
      location: e.location || '',
      poster: e.poster || null,
      photos: e.photos || [],
      registration_enabled: !!e.registrationEnabled,
      organizers: e.organizers || '',
      created_at: e.createdAt || new Date(),
      updated_at: e.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[Event Error] ${e.title}:`, error.message);
      report.Event.failed++;
    } else {
      report.Event.migrated++;
    }
  }

  // 7. Migrate Documents
  const mongoDocs = await Document.find().lean();
  report.Document = { mongoCount: mongoDocs.length, migrated: 0, failed: 0 };
  for (const d of mongoDocs) {
    const id = mongoIdToUuid(d._id);
    const unit_id = mongoIdToUuid(d.unitId);
    const academic_year_id = mongoIdToUuid(d.academicYearId);
    const event_id = mongoIdToUuid(d.eventId);
    const { error } = await supabase.from('documents').upsert({
      id,
      unit_id,
      academic_year_id,
      event_id,
      title: d.title,
      description: d.description || '',
      document_type: d.documentType || 'Other Documents',
      file_path: d.filePath,
      file_size: d.fileSize || 0,
      mime_type: d.mimeType || '',
      downloads_count: d.downloadsCount || 0,
      visibility: d.visibility || 'Public',
      created_at: d.createdAt || new Date(),
      updated_at: d.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[Document Error] ${d.title}:`, error.message);
      report.Document.failed++;
    } else {
      report.Document.migrated++;
    }
  }

  // 8. Migrate Gallery
  const mongoGallery = await Gallery.find().lean();
  report.Gallery = { mongoCount: mongoGallery.length, migrated: 0, failed: 0 };
  for (const g of mongoGallery) {
    const id = mongoIdToUuid(g._id);
    const unit_id = mongoIdToUuid(g.unitId);
    const academic_year_id = mongoIdToUuid(g.academicYearId);
    const event_id = mongoIdToUuid(g.eventId);
    const { error } = await supabase.from('gallery').upsert({
      id,
      unit_id,
      academic_year_id,
      event_id,
      album: g.album || '',
      category: g.category || 'General',
      title: g.title || '',
      description: g.description || '',
      file_path: g.filePath,
      thumbnail: g.thumbnail || null,
      created_at: g.createdAt || new Date(),
      updated_at: g.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[Gallery Error] ${g.title}:`, error.message);
      report.Gallery.failed++;
    } else {
      report.Gallery.migrated++;
    }
  }

  // 9. Migrate JoinRequests
  const mongoJoins = await JoinRequest.find().lean();
  report.JoinRequest = { mongoCount: mongoJoins.length, migrated: 0, failed: 0 };
  for (const j of mongoJoins) {
    const id = mongoIdToUuid(j._id);
    const unit_id = mongoIdToUuid(j.unitId);
    const academic_year_id = mongoIdToUuid(j.academicYearId);
    const { error } = await supabase.from('join_requests').upsert({
      id,
      unit_id,
      academic_year_id,
      name: j.name,
      email: j.email,
      phone: j.phone,
      gender: j.gender || 'Male',
      dob: j.dob || null,
      college: j.college,
      department: j.department,
      year: j.year,
      city: j.city,
      skills: j.skills || [],
      interests: j.interests || [],
      previous_experience: j.previousExperience || '',
      reason: j.reason,
      resume_path: j.resumePath || null,
      profile_image_path: j.profileImagePath || null,
      status: j.status || 'Pending',
      admin_notes: j.adminNotes || '',
      created_at: j.createdAt || new Date(),
      updated_at: j.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[JoinRequest Error] ${j.name}:`, error.message);
      report.JoinRequest.failed++;
    } else {
      report.JoinRequest.migrated++;
    }
  }

  // 10. Migrate ContactMessages
  const mongoContacts = await ContactMessage.find().lean();
  report.ContactMessage = { mongoCount: mongoContacts.length, migrated: 0, failed: 0 };
  for (const c of mongoContacts) {
    const id = mongoIdToUuid(c._id);
    const { error } = await supabase.from('contact_messages').upsert({
      id,
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      subject: c.subject || 'General Inquiry',
      query: c.query,
      status: c.status || 'New',
      admin_reply: c.adminReply || '',
      created_at: c.createdAt || new Date(),
      updated_at: c.updatedAt || new Date(),
    });
    if (error) {
      console.error(`[ContactMessage Error] ${c.name}:`, error.message);
      report.ContactMessage.failed++;
    } else {
      report.ContactMessage.migrated++;
    }
  }

  // 11. Migrate AdminActivityLogs
  const mongoLogs = await AdminActivityLog.find().lean();
  report.AdminActivityLog = { mongoCount: mongoLogs.length, migrated: 0, failed: 0 };
  for (const l of mongoLogs) {
    const id = mongoIdToUuid(l._id);
    const admin_id = mongoIdToUuid(l.adminId);
    const unit_id = mongoIdToUuid(l.unitId);
    const { error } = await supabase.from('admin_activity_logs').upsert({
      id,
      admin_id,
      role: l.role,
      action: l.action,
      resource_type: l.resourceType,
      resource_id: l.resourceId || null,
      unit_id,
      ip_address: l.ipAddress || '',
      timestamp: l.timestamp || new Date(),
    });
    if (error) {
      console.error(`[AdminActivityLog Error] ${l.action}:`, error.message);
      report.AdminActivityLog.failed++;
    } else {
      report.AdminActivityLog.migrated++;
    }
  }

  console.log('\n=== MIGRATION SUMMARY TABLE ===');
  console.table(report);

  process.exit(0);
}

migrateData().catch(err => {
  console.error('[MIGRATION FATAL]', err.message);
  process.exit(1);
});
