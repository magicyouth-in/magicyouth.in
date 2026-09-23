const axios = require('axios');

async function verifyTeams() {
  const BASE_URL = 'https://magicyouth-in.vercel.app';
  console.log(`Verifying Teams on: ${BASE_URL}`);

  try {
    // 1. Fetch teams
    const teamsRes = await axios.get(`${BASE_URL}/api/teams`, { headers: { 'Cache-Control': 'no-cache' } });
    console.log('Teams API Status:', teamsRes.status, 'Count:', teamsRes.data?.data?.length);

    const alietTeam = teamsRes.data?.data?.find(t => t.name?.includes('Executive Board') || t.unitId?.name?.includes('ALIET'));
    if (!alietTeam) {
      throw new Error('ALIET team not found');
    }
    console.log('Selected Team:', alietTeam.name, '| Chapter:', alietTeam.unitId?.name, '| Year:', alietTeam.academicYearId?.year);

    // 2. Fetch members of ALIET team
    const membersRes = await axios.get(`${BASE_URL}/api/teams/${alietTeam._id}/members`, { headers: { 'Cache-Control': 'no-cache' } });
    console.log('Members API Status:', membersRes.status, 'Count:', membersRes.data?.data?.length);

    const members = membersRes.data?.data || [];
    const susmitha = members.find(m => m.name.includes('Susmitha'));

    if (susmitha) {
      console.log('Found Susmitha:');
      console.log(' - Name:', susmitha.name);
      console.log(' - Position:', susmitha.position);
      console.log(' - Department:', susmitha.department);
      console.log(' - Section:', susmitha.section);
      console.log(' - Experience / Bio:', susmitha.experience || susmitha.biography);
    } else {
      console.log('Susmitha not found in this team roster');
    }

    console.log('\nAll Members List:');
    members.forEach((m, i) => {
      console.log(` ${i + 1}. ${m.name} | Role: ${m.position} | Dept: ${m.department} | Section: ${m.section} | Has Experience: ${Boolean(m.experience || m.biography)}`);
    });

    console.log('\n[PASS] Teams Verification Successful.');
  } catch (err) {
    console.error('[FAIL] Verification error:', err.message, err.response?.data || '');
  }
}

verifyTeams();
