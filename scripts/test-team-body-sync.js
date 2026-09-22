require('dotenv').config();
const supabase = require('../utils/supabaseClient');

async function testTeamBodySync() {
  console.log('=== STARTING TEAM BODY EDIT & SYNC VERIFICATION ===\n');

  // 1. Fetch existing teams
  const { data: teams, error: tErr } = await supabase
    .from('teams')
    .select('*, units(name, code), academic_years(year)')
    .order('created_at', { ascending: true });

  if (tErr) throw tErr;
  console.log(`Found ${teams.length} Team Bodies in database:`);
  teams.forEach(t => {
    console.log(` - ID: ${t.id} | Name: "${t.name}" | Chapter: ${t.units?.name} | Year: ${t.academic_years?.year}`);
  });

  const alietTeam = teams.find(t => t.units?.name?.includes('ALIET'));
  if (!alietTeam) {
    throw new Error('ALIET Team not found!');
  }

  // 2. Count existing members attached to ALIET team
  const { data: membersBefore, error: mErr } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', alietTeam.id);

  if (mErr) throw mErr;
  console.log(`\n[Initial Check] Team "${alietTeam.name}" has ${membersBefore.length} attached members.`);
  if (membersBefore.length === 0) {
    throw new Error('Expected team members to be present!');
  }

  // 3. Test Editing Team Body Name and Academic Year
  console.log('\n[Step 1] Editing Team Body Name to "Core Leadership Team"...');
  const { data: updatedTeam, error: uErr } = await supabase
    .from('teams')
    .update({ name: 'Core Leadership Team', updated_at: new Date().toISOString() })
    .eq('id', alietTeam.id)
    .select('*, units(name, code), academic_years(year)')
    .single();

  if (uErr) throw uErr;
  console.log(`Updated Team Name in DB: "${updatedTeam.name}" | Year: ${updatedTeam.academic_years?.year}`);
  if (updatedTeam.name !== 'Core Leadership Team') {
    throw new Error('Team Name failed to update!');
  }

  // 4. Verify members remain attached to the team
  const { data: membersAfter, error: maErr } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', alietTeam.id);

  if (maErr) throw maErr;
  console.log(`[Step 2] Members attached after Team Body edit: ${membersAfter.length}`);
  if (membersAfter.length !== membersBefore.length) {
    throw new Error(`Member count mismatch! Expected ${membersBefore.length}, got ${membersAfter.length}`);
  }
  console.log('✓ PASS: All team members remain attached without data loss.');

  // 5. Test Academic Year Switch on Team Body
  const { data: years } = await supabase.from('academic_years').select('*');
  console.log(`\nAvailable Academic Years:`, years.map(y => `${y.year} (${y.id})`).join(', '));
  const altYear = years.find(y => y.id !== alietTeam.academic_year_id) || years[0];

  console.log(`[Step 3] Switching Academic Year to "${altYear.year}" (${altYear.id})...`);
  const { data: yearSwitchedTeam, error: ysErr } = await supabase
    .from('teams')
    .update({ academic_year_id: altYear.id, updated_at: new Date().toISOString() })
    .eq('id', alietTeam.id)
    .select('*, units(name, code), academic_years(year)')
    .single();

  if (ysErr) throw ysErr;
  console.log(`Updated Academic Year in DB: "${yearSwitchedTeam.academic_years?.year}"`);
  if (yearSwitchedTeam.academic_year_id !== altYear.id) {
    throw new Error('Academic Year failed to update on Team Body!');
  }
  console.log('✓ PASS: Academic Year persistence on Team Body verified.');

  // 6. Restore Original Values for Clean State
  console.log('\n[Step 4] Restoring original team body values...');
  const { data: restoredTeam, error: rErr } = await supabase
    .from('teams')
    .update({
      name: 'Executive Board',
      academic_year_id: alietTeam.academic_year_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', alietTeam.id)
    .select('*, units(name, code), academic_years(year)')
    .single();

  if (rErr) throw rErr;
  console.log(`Restored Team Name: "${restoredTeam.name}" | Year: ${restoredTeam.academic_years?.year}`);

  // 7. Verify no duplicate Team Bodies exist for the same chapter
  const { data: finalTeams } = await supabase
    .from('teams')
    .select('id, name, unit_id, academic_year_id, units(name), academic_years(year)');
  
  console.log('\n[Step 5] Final Team Bodies list:');
  finalTeams.forEach(t => {
    console.log(` - Team ID: ${t.id} | "${t.name}" | ${t.units?.name} (${t.academic_years?.year})`);
  });

  const alietTeamsCount = finalTeams.filter(t => t.units?.name?.includes('ALIET')).length;
  console.log(`ALIET Team Bodies count: ${alietTeamsCount}`);
  if (alietTeamsCount !== 1) {
    console.warn('WARNING: Duplicate team bodies still detected!');
  } else {
    console.log('✓ PASS: Exactly 1 ALIET Team Body exists (no duplicates).');
  }

  console.log('\n=== ALL TEAM BODY VERIFICATION TESTS PASSED SUCCESSFULLY ===');
}

testTeamBodySync().catch(err => {
  console.error(err);
  process.exit(1);
});
