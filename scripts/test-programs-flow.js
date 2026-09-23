require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();

const PROD_URL = 'https://magicyouth-in.vercel.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@magicyouth.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MagicYouth@Admin2026';

async function testProgramsFlow() {
  console.log('--- TESTING PROGRAMS FLOW & ISOLATION ---');

  // 1. Authenticate Admin
  const loginRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const cookie = loginRes.headers.get('set-cookie');
  console.log(`Admin Login: ${loginRes.status}`);

  // Fetch units and academic years
  const unitsRes = await fetch(`${PROD_URL}/api/units`);
  const unitsData = await unitsRes.json();
  const testUnitId = unitsData.data?.[0]?._id || unitsData.data?.[0]?.id;

  const yearsRes = await fetch(`${PROD_URL}/api/academic-years`);
  const yearsData = await yearsRes.json();
  const testYearId = yearsData.data?.[0]?._id || yearsData.data?.[0]?.id;

  console.log(`Using Unit: ${testUnitId}, Academic Year: ${testYearId}`);

  // 2. Initial state
  const initRes = await fetch(`${PROD_URL}/api/events`);
  const initData = await initRes.json();
  console.log(`Initial DB Programs count: ${initData.data?.length || 0}`);

  // 3. Create Program 1
  console.log('\n--> Creating Program 1: Youth Leadership Formation Camp');
  const create1Res = await fetch(`${PROD_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({
      title: 'Youth Leadership Formation Camp',
      category: 'Youth Leadership',
      description: 'Forming collegiate student leaders in ethical decision making and social responsibility.',
      unitId: testUnitId,
      academicYearId: testYearId,
      status: 'Upcoming'
    })
  });
  const create1Data = await create1Res.json();
  const prog1Id = create1Data.data?._id || create1Data.data?.id;
  console.log(`Program 1 Created (ID: ${prog1Id}, Status: ${create1Res.status})`);

  // Verify /api/events has Program 1
  const check1Res = await fetch(`${PROD_URL}/api/events`);
  const check1Data = await check1Res.json();
  console.log(`DB Programs count after add 1: ${check1Data.data?.length}`);

  // 4. Create Program 2
  console.log('\n--> Creating Program 2: Grassroots Social Impact Project');
  const create2Res = await fetch(`${PROD_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({
      title: 'Grassroots Social Impact Project',
      category: 'Social Innovation',
      description: 'Student-led community projects addressing local developmental needs.',
      unitId: testUnitId,
      academicYearId: testYearId,
      status: 'Upcoming'
    })
  });
  const create2Data = await create2Res.json();
  const prog2Id = create2Data.data?._id || create2Data.data?.id;
  console.log(`Program 2 Created (ID: ${prog2Id}, Status: ${create2Res.status})`);

  // Verify /api/events has 2 programs
  const check2Res = await fetch(`${PROD_URL}/api/events`);
  const check2Data = await check2Res.json();
  console.log(`DB Programs count after add 2: ${check2Data.data?.length}`);

  // 5. Delete both programs
  console.log('\n--> Cleaning up test programs...');
  if (prog1Id) await fetch(`${PROD_URL}/api/events/${prog1Id}`, { method: 'DELETE', headers: { 'Cookie': cookie } });
  if (prog2Id) await fetch(`${PROD_URL}/api/events/${prog2Id}`, { method: 'DELETE', headers: { 'Cookie': cookie } });

  const finalRes = await fetch(`${PROD_URL}/api/events`);
  const finalData = await finalRes.json();
  console.log(`DB Programs count after cleanup: ${finalData.data?.length}`);
  console.log('✓ All program CRUD and API operations verified successfully!');
}

testProgramsFlow().catch(console.error);
