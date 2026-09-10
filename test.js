require('dotenv').config(); const axios = require('axios');
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
    console.log('Login:', loginRes.data.success);
    const cookie = loginRes.headers['set-cookie'];
    if (cookie) api.defaults.headers.Cookie = cookie;

    // Get units
    const unitsRes = await api.get('/units');
    const unitId = unitsRes.data.data[0]?._id;
    
    const yearsRes = await api.get('/academic-years?unitId=' + unitId);
    const yearId = yearsRes.data.data[0]?._id;
    
    console.log('Unit:', unitId, 'Year:', yearId);

    if (!unitId || !yearId) return;

    // Test Event Upload
    const dummyImage = path.join(__dirname, 'dummy.png');
    fs.writeFileSync(dummyImage, 'fake png data');
    
    const eventForm = new FormData();
    eventForm.append('title', 'Test Event');
    eventForm.append('description', 'Test Description');
    eventForm.append('unitId', unitId);
    eventForm.append('academicYearId', yearId);
    eventForm.append('startDate', new Date().toISOString());
    eventForm.append('status', 'Upcoming');
    eventForm.append('poster', fs.createReadStream(dummyImage));

    const eventRes = await api.post('/events', eventForm, { headers: eventForm.getHeaders() });
    console.log('Event Created:', eventRes.data.success, eventRes.data.data?._id);
    const eventId = eventRes.data.data?._id;

    // Cleanup
    if (eventId) {
      await api.delete('/events/' + eventId);
      console.log('Event Deleted');
    }
    fs.unlinkSync(dummyImage);
    console.log('Tests Done');

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
