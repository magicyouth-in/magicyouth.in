/**
 * scripts/test-member-portal.js
 * End-to-end test for the Member Portal API.
 *
 * Pre-requisites:
 *   1. Server running: node server.js (or npm start)
 *   2. DB migration applied: scripts/member-portal-migration.sql
 *   3. A unit exists in the database
 *   4. An admin user exists
 *
 * Run: node scripts/test-member-portal.js
 */

require('dotenv').config();
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function req(method, path, body, cookies = '') {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    credentials: 'include',
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
}

function extractCookie(headers, name) {
  const setCookies = headers.raw?.()?.['set-cookie'] || [];
  for (const c of setCookies) {
    const match = c.match(new RegExp(`${name}=([^;]+)`));
    if (match) return `${name}=${match[1]}`;
  }
  return '';
}

let pass = 0;
let fail = 0;

function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    pass++;
  } else {
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ''}`);
    fail++;
  }
}

async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  MAGIC Youth — Member Portal End-to-End Test');
  console.log('══════════════════════════════════════════════════════\n');

  // 1. Check server
  console.log('1. Server health check');
  const health = await req('GET', '/api/auth/status');
  ok('Server is responding', health.status === 200);

  // 2. Public verify with bad ID
  console.log('\n2. Member verification (bad ID)');
  const badVerify = await req('GET', '/api/members/verify/MAGIC-TEST-9999');
  ok('Returns 404 for unknown member', badVerify.status === 404);

  // 3. Member login with wrong credentials
  console.log('\n3. Member login — invalid credentials');
  const badLogin = await req('POST', '/api/member/auth/login', { memberId: 'MAGIC-TEST-0000', password: 'wrong' });
  ok('Rejects invalid Member ID', badLogin.status === 401);

  // 4. Member status unauthenticated
  console.log('\n4. Member auth status — unauthenticated');
  const unauth = await req('GET', '/api/member/auth/status');
  ok('Returns loggedIn: false when no cookie', unauth.data.loggedIn === false);

  // 5. Member profile unauthenticated
  console.log('\n5. Member profile — unauthenticated');
  const noProfile = await req('GET', '/api/members/me');
  ok('Returns 401 for unauthenticated request', noProfile.status === 401);

  // 6. Member events unauthenticated
  console.log('\n6. Member events — unauthenticated');
  const noEvents = await req('GET', '/api/member/events');
  ok('Returns 401 for unauthenticated request', noEvents.status === 401);

  // 7. Unit announcements admin required
  console.log('\n7. Admin announcements — unauthenticated');
  const noAnnouncAdmin = await req('GET', '/api/unit-announcements');
  ok('Returns 401 for unauthenticated admin request', noAnnouncAdmin.status === 401);

  // 8. Unit announcement my — member required
  console.log('\n8. Member announcements — unauthenticated');
  const noAnnouncMember = await req('GET', '/api/unit-announcements/my');
  ok('Returns 401 for unauthenticated member request', noAnnouncMember.status === 401);

  // 9. Members admin list — unauthenticated
  console.log('\n9. Members admin list — unauthenticated');
  const noMembers = await req('GET', '/api/members');
  ok('Returns 401 for unauthenticated admin request', noMembers.status === 401);

  // 10. Approve join request — unauthenticated
  console.log('\n10. Member approval — unauthenticated');
  const noApprove = await req('POST', '/api/members/approve/fake-id');
  ok('Returns 401 for unauthenticated approval', noApprove.status === 401);

  // Summary
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Results: ${pass} passed, ${fail} failed`);
  console.log('══════════════════════════════════════════════════════\n');

  if (fail > 0) {
    console.log('MANUAL STEPS to complete the full end-to-end test:');
    console.log('1. Apply DB migration: scripts/member-portal-migration.sql in Supabase SQL Editor');
    console.log('2. Apply RPC: scripts/member-id-rpc.sql in Supabase SQL Editor');
    console.log('3. Submit a Join application via /join');
    console.log('4. Log in to Admin → Member Portal → Members → find application in Join MAGIC Apps');
    console.log('5. Click Approve → note Member ID and temp password');
    console.log('6. Go to /member/login → use Member ID + temp password');
    console.log('7. Verify dashboard, E-Card, QR code');
    console.log('8. Create an event in Admin → Events');
    console.log('9. Register for the event as a member');
    console.log('10. Verify it appears in My Registrations');
    console.log('11. Admin → Member Portal → Announcements → create a unit announcement');
    console.log('12. Verify member sees it in Announcements tab');
    console.log('13. Admin → Member Portal → Certificates → issue certificate');
    console.log('14. Verify member sees it in My Certificates');
    process.exit(1);
  }

  console.log('All automated checks passed. Run manual steps above to complete E2E verification.');
  process.exit(0);
}

run().catch(err => {
  console.error('[TEST ERROR]', err.message);
  process.exit(1);
});
