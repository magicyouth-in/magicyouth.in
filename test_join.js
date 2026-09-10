require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API = 'http://localhost:3000/api';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@magicyouth.in';
const PASSWORD = process.env.ADMIN_PASSWORD || 'your_admin_password_here';

async function run() {
  try {
    const api = axios.create({ baseURL: API, withCredentials: true });
    
    // Login
    const loginRes = await api.post('/auth/login', { email: EMAIL, password: PASSWORD });
    const cookie = loginRes.headers['set-cookie'];
    if (cookie) api.defaults.headers.Cookie = cookie;

    // Get units
    const unitsRes = await api.get('/units');
    const unitId = unitsRes.data.data[0]?._id;

    // Test Join Form Upload
    const dummyImage = path.join(__dirname, 'dummy.jpg');
    fs.writeFileSync(dummyImage, 'fake img data');
    const dummyResume = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(dummyResume, 'fake resume data');
    
    const joinForm = new FormData();
    joinForm.append('unitId', unitId);
    joinForm.append('name', 'Test Student');
    joinForm.append('email', 'test@example.com');
    joinForm.append('phone', '1234567890');
    joinForm.append('department', 'CS');
    joinForm.append('batchYear', '2025');
    joinForm.append('whyJoin', 'I love magic.');
    joinForm.append('profileImage', fs.createReadStream(dummyImage));
    joinForm.append('resume', fs.createReadStream(dummyResume));

    const joinRes = await api.post('/join', joinForm, { headers: joinForm.getHeaders() });
    console.log('Join Request Submitted:', joinRes.data.success);
    const joinId = joinRes.data.data?._id;

    if (joinId) {
      // Admin should be able to see it
      const checkRes = await api.get(`/join`);
      const myReq = checkRes.data.data.find(d => d._id === joinId);
      console.log('Join request found in admin list:', !!myReq);

      await api.delete('/join/' + joinId);
      console.log('Join Request Deleted');
    }
    fs.unlinkSync(dummyImage);
    fs.unlinkSync(dummyResume);
    console.log('Tests Done');

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
