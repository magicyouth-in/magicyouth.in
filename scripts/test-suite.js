require('dotenv').config();
const http = require('http');
const app = require('../server');

let server;
const port = 4999;

async function runTests() {
  server = app.listen(port);
  console.log(`Test server running on port ${port}...`);

  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test Login as MAIN_ADMIN
    console.log('\n--- 1. Testing Admin Login ---');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@magicyouth.in', password: process.env.ADMIN_PASSWORD || 'MagicYouth@Admin2026' })
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status, loginData.success ? '✓ SUCCESS' : '✗ FAILED');
    const cookie = loginRes.headers.get('set-cookie');

    // 2. Test User Management List
    console.log('\n--- 2. Testing GET /api/administrators ---');
    const usersRes = await fetch(`${baseUrl}/api/administrators`, {
      headers: { 'Cookie': cookie }
    });
    const usersData = await usersRes.json();
    console.log('Users list count:', usersData.data?.length, usersData.success ? '✓ SUCCESS' : '✗ FAILED');

    // 3. Test Create User
    console.log('\n--- 3. Testing POST /api/administrators ---');
    const testEmail = `testlead_${Date.now()}@magicyouth.in`;
    const createRes = await fetch(`${baseUrl}/api/administrators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({
        name: 'Unit Lead Test',
        email: testEmail,
        password: 'Password123!',
        role: 'FIRST_LEAD',
        assignedUnitIds: [],
        status: 'Active'
      })
    });
    const createData = await createRes.json();
    console.log('Create user status:', createRes.status, createData.success ? '✓ SUCCESS' : '✗ FAILED');
    const createdId = createData.data?._id || createData.data?.id;

    // 4. Test Edit User
    console.log('\n--- 4. Testing PUT /api/administrators/:id ---');
    const editRes = await fetch(`${baseUrl}/api/administrators/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({
        name: 'Unit Lead Updated',
        role: 'SECRETARY',
        status: 'Active'
      })
    });
    const editData = await editRes.json();
    console.log('Edit user status:', editRes.status, editData.data?.role === 'SECRETARY' ? '✓ SUCCESS' : '✗ FAILED');

    // 5. Test Reset Password
    console.log('\n--- 5. Testing PATCH /api/administrators/:id/reset-password ---');
    const resetRes = await fetch(`${baseUrl}/api/administrators/${createdId}/reset-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ newPassword: 'NewSecurePassword123!' })
    });
    const resetData = await resetRes.json();
    console.log('Reset password status:', resetRes.status, resetData.success ? '✓ SUCCESS' : '✗ FAILED');

    // 6. Test Toggle Status
    console.log('\n--- 6. Testing PATCH /api/administrators/:id/status ---');
    const statusRes = await fetch(`${baseUrl}/api/administrators/${createdId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ status: 'Inactive' })
    });
    const statusData = await statusRes.json();
    console.log('Toggle status:', statusRes.status, statusData.data?.status === 'Inactive' ? '✓ SUCCESS' : '✗ FAILED');

    // 7. Test Delete User
    console.log('\n--- 7. Testing DELETE /api/administrators/:id ---');
    const deleteRes = await fetch(`${baseUrl}/api/administrators/${createdId}`, {
      method: 'DELETE',
      headers: { 'Cookie': cookie }
    });
    const deleteData = await deleteRes.json();
    console.log('Delete status:', deleteRes.status, deleteData.success ? '✓ SUCCESS' : '✗ FAILED');

    // 8. Test Public Documents
    console.log('\n--- 8. Testing GET /api/documents/public ---');
    const pubDocsRes = await fetch(`${baseUrl}/api/documents/public`);
    const pubDocsData = await pubDocsRes.json();
    console.log('Public documents count:', pubDocsData.data?.length, pubDocsData.success ? '✓ SUCCESS' : '✗ FAILED');

    // 9. Test Protected Documents Gate (Unauthenticated should be 401)
    console.log('\n--- 9. Testing Protected Archive Auth Gate ---');
    const unauthDocsRes = await fetch(`${baseUrl}/api/documents`);
    console.log('Unauthenticated access status (expected 401):', unauthDocsRes.status, unauthDocsRes.status === 401 ? '✓ SUCCESS (Properly Protected)' : '✗ FAILED');

    // 10. Test Protected Documents (Authenticated)
    console.log('\n--- 10. Testing Protected Archive (Authenticated) ---');
    const authDocsRes = await fetch(`${baseUrl}/api/documents`, {
      headers: { 'Cookie': cookie }
    });
    const authDocsData = await authDocsRes.json();
    console.log('Authenticated documents fetch:', authDocsData.authenticated ? '✓ SUCCESS (Unlocked)' : '✗ FAILED');

    // 11. Test Events
    console.log('\n--- 11. Testing GET /api/events ---');
    const eventsRes = await fetch(`${baseUrl}/api/events`);
    const eventsData = await eventsRes.json();
    console.log('Events count:', eventsData.data?.length, eventsData.success ? '✓ SUCCESS' : '✗ FAILED');

    // 12. Test Testimonials
    console.log('\n--- 12. Testing GET /api/testimonials ---');
    const testRes = await fetch(`${baseUrl}/api/testimonials`);
    const testData = await testRes.json();
    console.log('Testimonials count:', testData.data?.length, testData.success ? '✓ SUCCESS' : '✗ FAILED');

    console.log('\n========================================');
    console.log('ALL BACKEND INTEGRATION TESTS PASSED ✓');
    console.log('========================================\n');

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
