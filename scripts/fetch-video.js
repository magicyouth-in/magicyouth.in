const fs = require('fs');
const path = require('path');
const https = require('https');

const videoPath = path.join(__dirname, '..', 'public', 'videos', 'magic-youth.mp4');
const targetDir = path.dirname(videoPath);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const stats = fs.existsSync(videoPath) ? fs.statSync(videoPath) : null;

// If video file is already present and is the real video (> 1 MB), no need to fetch
if (stats && stats.size > 1024 * 1024) {
  console.log(`[fetch-video] Video asset is already present (${(stats.size / 1024 / 1024).toFixed(2)} MB).`);
  process.exit(0);
}

console.log('[fetch-video] Video asset is missing or is an LFS pointer. Downloading full video from GitHub media CDN...');

const url = 'https://media.githubusercontent.com/media/magicyouth-in/magicyouth.in/main/public/videos/magic-youth.mp4';

function download(fileUrl, destination) {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, { headers: { 'User-Agent': 'Vercel-Build' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location, destination));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download video: HTTP ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(destination);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => {
          const finalStats = fs.statSync(destination);
          console.log(`[fetch-video] Successfully downloaded video (${(finalStats.size / 1024 / 1024).toFixed(2)} MB).`);
          resolve();
        });
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

download(url, videoPath)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('[fetch-video] Download error:', err.message);
    // Non-fatal to prevent build breaking, but logs error
    process.exit(0);
  });
