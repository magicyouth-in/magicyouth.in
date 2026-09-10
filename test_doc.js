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
    const yearsRes = await api.get('/academic-years?unitId=' + unitId);
    const yearId = yearsRes.data.data[0]?._id;

    // Test Document Upload
    const dummyFile = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(dummyFile, 'fake pdf data');
    
    const docForm = new FormData();
    docForm.append('title', 'Test Document');
    docForm.append('unitId', unitId);
    docForm.append('academicYearId', yearId);
    docForm.append('file', fs.createReadStream(dummyFile));

    const docRes = await api.post('/documents', docForm, { headers: docForm.getHeaders() });
    console.log('Doc Created:', docRes.data.success);
    const docId = docRes.data.data?._id;

    if (docId) {
      // Test download increment
      try {
        await api.get(`/documents/download/${docId}`, { maxRedirects: 0 });
      } catch (err) {
        if (err.response?.status === 302) {
          console.log('Download route hit (Redirected)');
        }
      }

      // Check count
      const checkRes = await api.get(`/documents`);
      const myDoc = checkRes.data.data.find(d => d._id === docId);
      console.log('Download Count:', myDoc?.downloads || myDoc?.download_count || 0);

      await api.delete('/documents/' + docId);
      console.log('Doc Deleted');
    }
    fs.unlinkSync(dummyFile);
    console.log('Tests Done');

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
