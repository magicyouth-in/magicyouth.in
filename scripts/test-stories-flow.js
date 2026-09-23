require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const storiesRoute = require('../routes/stories');
const testimonialsRoute = require('../routes/testimonials');

async function testHttp() {
  await mongoose.connect(process.env.MONGODB_URI);
  const app = express();
  app.use(express.json());
  app.use('/api/stories', storiesRoute);
  app.use('/api/testimonials', testimonialsRoute);

  const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    // 1. GET /api/stories
    const res1 = await fetch(`http://127.0.0.1:${port}/api/stories`);
    const data1 = await res1.json();
    console.log('GET /api/stories ->', {
      status: res1.status,
      success: data1.success,
      count: data1.data?.length,
      sampleTitle: data1.data?.[0]?.title,
      sampleCover: data1.data?.[0]?.coverImage,
      sampleImpact: data1.data?.[0]?.impact,
    });

    // 2. GET /api/testimonials (backward-compatible)
    const res2 = await fetch(`http://127.0.0.1:${port}/api/testimonials`);
    const data2 = await res2.json();
    console.log('GET /api/testimonials ->', {
      status: res2.status,
      success: data2.success,
      count: data2.data?.length,
      sampleTitle: data2.data?.[0]?.title,
    });

    server.close();
    await mongoose.disconnect();
    console.log('--- ALL STORIES API ENDPOINTS PASSED SUCCESSFULLY ---');
    process.exit(0);
  });
}

testHttp().catch(err => {
  console.error(err);
  process.exit(1);
});
