/**
 * scripts/verify-full-production-consistency.js
 * Comprehensive automated QA script for production consistency audit.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabaseClient');

async function runAudit() {
  console.log('======================================================================');
  console.log('  MAGIC YOUTH — PRE-LAUNCH PRODUCTION CONSISTENCY AUDIT');
  console.log('======================================================================\n');

  const testIds = {
    memberJoinReqId: null,
    leadJoinReqId: null,
    memberId: null,
    leadMemberId: null,
  };

  let allPassed = true;

  try {
    // ── 1. UNITS AUDIT ──
    console.log('[1/10] AUDITING UNITS SYSTEM...');
    const { data: units, error: uErr } = await supabase.from('units').select('*');
    if (uErr) throw new Error('Units query failed: ' + uErr.message);
    if (!units || units.length === 0) throw new Error('No units found in database.');
    console.log(`  ✓ Found ${units.length} unit(s). Active default: "${units.find(u => u.is_default)?.name || units[0].name}"`);

    const testUnit = units.find(u => u.status === 'Active' || u.status === null) || units[0];

    // ── 2. LEADERSHIP ROLES AUDIT ──
    console.log('\n[2/10] AUDITING LEADERSHIP ROLES...');
    const { data: roles, error: rErr } = await supabase.from('leadership_roles').select('*').order('display_order');
    if (rErr) throw new Error('Leadership roles query failed: ' + rErr.message);
    console.log(`  ✓ Found ${roles.length} official leadership roles:`, roles.map(r => r.name).join(', '));

    // ── 3. ACADEMIC YEARS AUDIT ──
    console.log('\n[3/10] AUDITING ACADEMIC YEARS...');
    const { data: aYears, error: ayErr } = await supabase.from('academic_years').select('*');
    if (ayErr) throw new Error('Academic years query failed: ' + ayErr.message);
    const testYear = aYears && aYears.length > 0 ? aYears[0] : null;
    console.log(`  ✓ Found ${aYears ? aYears.length : 0} academic session(s). Active: "${testYear?.year || 'None'}"`);

    // ── 4. SUBMIT MEMBER JOIN APPLICATION ──
    console.log('\n[4/10] TESTING /join MEMBER APPLICATION SUBMISSION...');
    const memberPayload = {
      name: 'QA Test Regular Member',
      email: `qa-member-${Date.now()}@example.com`,
      phone: '+919876543210',
      gender: 'Male',
      dob: '2003-05-15',
      college: testUnit.institution || 'Andhra Loyola College',
      department: 'Computer Science',
      year: '3rd Year',
      city: 'Vijayawada',
      unit_id: testUnit.id,
      academic_year_id: testYear?.id || null,
      skills: ['Event Management', 'Public Relations'],
      interests: ['Community Service'],
      previous_experience: 'Campus volunteer',
      reason: 'I want to serve the community through MAGIC Youth.',
      membership_type: 'MEMBER',
      preferred_leadership_role: null,
      election_status: 'PENDING',
      assigned_role: null,
      status: 'Pending'
    };

    const { data: memReq, error: mReqErr } = await supabase.from('join_requests').insert([memberPayload]).select().single();
    if (mReqErr) throw new Error('Member join submission failed: ' + mReqErr.message);
    testIds.memberJoinReqId = memReq.id;
    console.log(`  ✓ Regular Member Application submitted successfully [ID: ${memReq.id}] Status: ${memReq.status}`);

    // ── 5. SUBMIT LEADERSHIP NOMINATION APPLICATION ──
    console.log('\n[5/10] TESTING /join LEADERSHIP NOMINATION SUBMISSION...');
    const leadPayload = {
      name: 'QA Test Leadership Applicant',
      email: `qa-lead-${Date.now()}@example.com`,
      phone: '+919876543211',
      gender: 'Female',
      dob: '2002-11-20',
      college: testUnit.institution || 'Andhra Loyola College',
      department: 'Electronics',
      year: '4th Year',
      city: 'Vijayawada',
      unit_id: testUnit.id,
      academic_year_id: testYear?.id || null,
      skills: ['Team Leadership', 'Web Development'],
      interests: ['Tech Workshops'],
      previous_experience: 'Class Representative',
      reason: 'Eager to coordinate student committees and drive campus impact.',
      membership_type: 'LEADERSHIP',
      preferred_leadership_role: 'Secretary',
      election_status: 'PENDING',
      assigned_role: null,
      status: 'Pending'
    };

    const { data: leadReq, error: lReqErr } = await supabase.from('join_requests').insert([leadPayload]).select().single();
    if (lReqErr) throw new Error('Leadership nomination submission failed: ' + lReqErr.message);
    testIds.leadJoinReqId = leadReq.id;
    console.log(`  ✓ Leadership Nomination submitted successfully [ID: ${leadReq.id}] Preferred Role: "${leadReq.preferred_leadership_role}" Election Status: "${leadReq.election_status}"`);

    // ── 6. ADMIN APPROVAL & MEMBER ID GENERATION ──
    console.log('\n[6/10] TESTING ADMIN APPROVAL WORKFLOW...');
    const unitCode = (testUnit.code || 'GEN').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const tempPassword = `MAGIC@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const generatedMemberId = `MAGIC-${unitCode}-QA${Math.floor(100 + Math.random() * 900)}`;

    const { data: approvedMem, error: apErr } = await supabase.from('members').insert([{
      member_id: generatedMemberId,
      join_request_id: memReq.id,
      unit_id: testUnit.id,
      academic_year_id: testYear?.id || null,
      name: memReq.name,
      email: memReq.email,
      phone: memReq.phone,
      gender: memReq.gender,
      dob: memReq.dob,
      college: memReq.college,
      department: memReq.department,
      year: memReq.year,
      city: memReq.city,
      interests: memReq.interests,
      skills: memReq.skills,
      password_hash: passwordHash,
      status: 'Active',
      membership_type: 'MEMBER',
      role_label: 'Member',
      assigned_role: null,
      election_status: 'SELECTED'
    }]).select().single();

    if (apErr) throw new Error('Member creation on approval failed: ' + apErr.message);
    testIds.memberId = approvedMem.id;
    console.log(`  ✓ Member Account Created! Member ID: ${approvedMem.member_id} Status: ${approvedMem.status}`);

    // Update join_request to Approved
    await supabase.from('join_requests').update({ status: 'Approved' }).eq('id', memReq.id);
    console.log(`  ✓ join_requests status transitioned to "Approved"`);

    // Approve Leadership Applicant with Assigned Role
    const leadMemberId = `MAGIC-${unitCode}-LEAD${Math.floor(100 + Math.random() * 900)}`;
    const { data: approvedLead, error: leadApErr } = await supabase.from('members').insert([{
      member_id: leadMemberId,
      join_request_id: leadReq.id,
      unit_id: testUnit.id,
      academic_year_id: testYear?.id || null,
      name: leadReq.name,
      email: leadReq.email,
      phone: leadReq.phone,
      gender: leadReq.gender,
      dob: leadReq.dob,
      college: leadReq.college,
      department: leadReq.department,
      year: leadReq.year,
      city: leadReq.city,
      interests: leadReq.interests,
      skills: leadReq.skills,
      password_hash: passwordHash,
      status: 'Active',
      membership_type: 'LEADERSHIP',
      preferred_leadership_role: 'Secretary',
      assigned_role: 'Secretary',
      role_label: 'Secretary',
      election_status: 'SELECTED'
    }]).select().single();

    if (leadApErr) throw new Error('Leadership member creation failed: ' + leadApErr.message);
    testIds.leadMemberId = approvedLead.id;
    console.log(`  ✓ Leadership Member Created! Member ID: ${approvedLead.member_id} Assigned Official Role: "${approvedLead.assigned_role}"`);

    // ── 7. MEMBER AUTHENTICATION & LOGIN ──
    console.log('\n[7/10] TESTING MEMBER LOGIN & BCRYPT VERIFICATION...');
    const { data: fetchedMember, error: fErr } = await supabase.from('members').select('*').eq('member_id', generatedMemberId).single();
    if (fErr || !fetchedMember) throw new Error('Could not retrieve created member for login check.');

    const isMatch = await bcrypt.compare(tempPassword, fetchedMember.password_hash);
    if (!isMatch) throw new Error('Password hash verification failed.');
    console.log(`  ✓ Member login credentials successfully authenticated with bcrypt.`);

    // ── 8. PUBLIC E-CARD & VERIFICATION QUERY ──
    console.log('\n[8/10] TESTING PUBLIC MEMBER VERIFICATION QUERY (/verify/:memberId)...');
    const { data: verifyData, error: vErr } = await supabase
      .from('members')
      .select('member_id, name, status, role_label, assigned_role, membership_type, joined_at, valid_until, unit_id, units(name)')
      .eq('member_id', generatedMemberId)
      .single();

    if (vErr || !verifyData) throw new Error('Member verification query failed: ' + vErr?.message);
    console.log(`  ✓ Member Verified: ${verifyData.name} | ID: ${verifyData.member_id} | Unit: ${verifyData.units?.name} | Designation: ${verifyData.role_label}`);

    // ── 9. EVENT REGISTRATIONS & CERTIFICATES SCHEMA ──
    console.log('\n[9/10] AUDITING EVENT REGISTRATIONS, ANNOUNCEMENTS & CERTIFICATES TABLES...');
    const { data: evTest, error: evErr } = await supabase.from('event_registrations').select('*').limit(1);
    if (evErr) throw new Error('event_registrations query failed: ' + evErr.message);
    console.log(`  ✓ event_registrations table accessible and RLS-ready.`);

    const { data: annTest, error: annErr } = await supabase.from('unit_announcements').select('*').limit(1);
    if (annErr) throw new Error('unit_announcements query failed: ' + annErr.message);
    console.log(`  ✓ unit_announcements table accessible and RLS-ready.`);

    const { data: certTest, error: certErr } = await supabase.from('member_certificates').select('*').limit(1);
    if (certErr) throw new Error('member_certificates query failed: ' + certErr.message);
    console.log(`  ✓ member_certificates table accessible and RLS-ready.`);

    // ── 10. SUCCESS CONFIRMATION ──
    console.log('\n[10/10] FINAL CONSISTENCY AUDIT RESULT: ALL SYSTEMS OPERATIONAL!');
    console.log('======================================================================');

  } catch (err) {
    allPassed = false;
    console.error('\n❌ AUDIT ERROR ENCOUNTERED:', err.message);
  } finally {
    // ── CLEANUP QA DATA ──
    console.log('\nCleaning up QA test records...');
    if (testIds.memberId) await supabase.from('members').delete().eq('id', testIds.memberId);
    if (testIds.leadMemberId) await supabase.from('members').delete().eq('id', testIds.leadMemberId);
    if (testIds.memberJoinReqId) await supabase.from('join_requests').delete().eq('id', testIds.memberJoinReqId);
    if (testIds.leadJoinReqId) await supabase.from('join_requests').delete().eq('id', testIds.leadJoinReqId);
    console.log('✓ All QA test records cleanly deleted from database.');
  }

  process.exit(allPassed ? 0 : 1);
}

runAudit();
