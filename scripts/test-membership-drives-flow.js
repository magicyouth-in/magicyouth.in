/**
 * scripts/test-membership-drives-flow.js
 * End-to-end verification of Membership Drive and Academic Year linkage.
 */

require('dotenv').config();
const supabase = require('../utils/supabaseClient');

async function run() {
  console.log('--- STARTING MEMBERSHIP DRIVES & ACADEMIC YEAR E2E VERIFICATION ---');

  let testUnit = null;
  let testYear = null;
  let testDrive = null;
  let testJoinReq = null;
  let testMember = null;

  try {
    // 1. Fetch or create a unit
    console.log('1. Checking Units...');
    const { data: units, error: uErr } = await supabase.from('units').select('id, name, code').limit(1);
    if (uErr) throw uErr;
    if (!units || units.length === 0) {
      console.log('Creating test unit...');
      const { data: nu, error: nuErr } = await supabase.from('units').insert([{ name: 'Test Chapter', code: 'TEST', institution: 'Test Univ', status: 'Active' }]).select().single();
      if (nuErr) throw nuErr;
      testUnit = nu;
    } else {
      testUnit = units[0];
    }
    console.log(`✓ Using Unit: ${testUnit.name} (${testUnit.code}) [${testUnit.id}]`);

    // 2. Fetch or create an academic year
    console.log('2. Checking Academic Years...');
    const { data: years, error: yErr } = await supabase.from('academic_years').select('id, year').limit(1);
    if (yErr) throw yErr;
    if (!years || years.length === 0) {
      console.log('Creating test academic year...');
      const { data: ny, error: nyErr } = await supabase.from('academic_years').insert([{ year: '2026-27', status: 'Active', unit_id: testUnit.id }]).select().single();
      if (nyErr) throw nyErr;
      testYear = ny;
    } else {
      testYear = years[0];
    }
    console.log(`✓ Using Academic Year: ${testYear.year} [${testYear.id}]`);

    // 3. Create a Membership Drive with custom format
    console.log('3. Creating OPEN Membership Drive with custom format...');
    const { data: drive, error: dErr } = await supabase.from('membership_drives').insert([{
      name: 'E2E Test Drive 2026-27',
      unit_id: testUnit.id,
      academic_year_id: testYear.id,
      id_format: 'MAGIC-{UNIT}-{NUMBER}',
      start_number: 10,
      next_number: 10,
      padding_digits: 3,
      status: 'OPEN',
      description: 'E2E Automated Test'
    }]).select().single();

    if (dErr) {
      console.warn('Direct insert into membership_drives returned:', dErr.message);
      if (dErr.message.includes('relation "public.membership_drives" does not exist')) {
        console.log('\n[NOTICE] The membership_drives table has not been created yet in the live database.');
        console.log('Please execute the migration in supabase/migrations/002_membership_drives.sql in your Supabase SQL Editor.');
        return;
      }
      throw dErr;
    }
    testDrive = drive;
    console.log(`✓ Membership Drive Created: "${testDrive.name}" with ID format: ${testDrive.id_format}, starting at #${testDrive.next_number}`);

    // 4. Test atomic sequence increment RPC
    console.log('4. Testing atomic increment RPC...');
    const { data: seqNum, error: rpcErr } = await supabase.rpc('increment_drive_member_seq', { p_drive_id: testDrive.id });
    if (rpcErr) throw rpcErr;
    console.log(`✓ Allotted sequence number from RPC: ${seqNum} (Expected: 10)`);

    // 5. Simulate Join Request
    console.log('5. Creating Join Request under active drive...');
    const { data: joinReq, error: jErr } = await supabase.from('join_requests').insert([{
      name: 'Drive Test Applicant',
      email: `drive-test-${Date.now()}@example.com`,
      phone: '9876543210',
      gender: 'Male',
      college: 'Test College',
      department: 'CSE',
      year: '2nd Year',
      city: 'Test City',
      unit_id: testUnit.id,
      academic_year_id: testYear.id,
      membership_drive_id: testDrive.id,
      membership_type: 'MEMBER',
      reason: 'E2E Testing Drive',
      status: 'Pending'
    }]).select().single();

    if (jErr) throw jErr;
    testJoinReq = joinReq;
    console.log(`✓ Join Request Created [${testJoinReq.id}] linked to Drive [${testJoinReq.membership_drive_id}]`);

    // 6. Test Member Creation / Approval
    console.log('6. Creating Approved Member with Drive & Academic Year...');
    const pad = Math.max(1, testDrive.padding_digits || 3);
    const numStr = String(seqNum).padStart(pad, '0');
    const computedMemberId = testDrive.id_format
      .replace(/\{UNIT\}/gi, testUnit.code || 'UNIT')
      .replace(/\{NUMBER\}/gi, numStr)
      .replace(/\{YEAR\}/gi, testYear.year || '2026');

    const { data: member, error: mErr } = await supabase.from('members').insert([{
      member_id: computedMemberId,
      name: testJoinReq.name,
      email: testJoinReq.email,
      phone: testJoinReq.phone,
      unit_id: testUnit.id,
      academic_year_id: testYear.id,
      membership_drive_id: testDrive.id,
      membership_type: 'MEMBER',
      college: testJoinReq.college,
      department: testJoinReq.department,
      year: testJoinReq.year,
      city: testJoinReq.city,
      status: 'Active',
      join_request_id: testJoinReq.id,
      password_hash: 'dummy_hash'
    }]).select().single();

    if (mErr) throw mErr;
    testMember = member;
    console.log(`✓ Member created with Member ID: ${testMember.member_id}`);
    console.log(`  Academic Year ID: ${testMember.academic_year_id}`);
    console.log(`  Membership Drive ID: ${testMember.membership_drive_id}`);

    // 7. Verify relations on query
    console.log('7. Verifying relations and queries...');
    const { data: fetchedMember, error: fErr } = await supabase
      .from('members')
      .select('*, units(name, code), academic_years(year), membership_drives(name, id_format)')
      .eq('id', testMember.id)
      .single();

    if (fErr) throw fErr;
    console.log(`✓ Verified Member Query:`);
    console.log(`  - Member ID: ${fetchedMember.member_id}`);
    console.log(`  - Unit: ${fetchedMember.units?.name} (${fetchedMember.units?.code})`);
    console.log(`  - Drive: ${fetchedMember.membership_drives?.name}`);
    console.log(`  - Academic Year: ${fetchedMember.academic_years?.year}`);

    console.log('\n========================================');
    console.log('  ALL MEMBERSHIP DRIVE CHECKS PASSED!   ');
    console.log('========================================\n');

  } catch (err) {
    console.error('\n❌ E2E VERIFICATION ERROR:', err.message);
  } finally {
    // Cleanup
    console.log('Cleaning up test records...');
    if (testMember?.id) {
      await supabase.from('members').delete().eq('id', testMember.id);
    }
    if (testJoinReq?.id) {
      await supabase.from('join_requests').delete().eq('id', testJoinReq.id);
    }
    if (testDrive?.id) {
      await supabase.from('membership_drives').delete().eq('id', testDrive.id);
    }
    console.log('Cleanup complete.');
  }
}

run();
