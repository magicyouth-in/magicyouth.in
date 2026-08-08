/**
 * server.js
 * MAGIC Youth Digital Platform — Production Server
 * Express + Socket.IO + JWT Auth + MongoDB Atlas + Nextcloud WebDAV
 */

require('dotenv').config();

const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cookieParser = require('cookie-parser');
const path         = require('path');
const fs           = require('fs');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');

const { connectDB }  = require('./database/mongoose');
const { initStorage } = require('./utils/webdav');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
});

app.set('io', io);

const PORT = process.env.PORT || 3000;

// ─── ENSURE TEMP UPLOAD DIRECTORY ─────────────────────────────────────────────
fs.mkdirSync(path.join(__dirname, 'uploads', 'tmp'), { recursive: true });

// ─── SECURITY & MIDDLEWARE ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB connection for serverless requests
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed.' });
  }
});

// Rate Limiter — API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  message:  { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Auth rate limiter — stricter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Too many login attempts. Please try again later.' }
});
app.use('/api/auth/login', loginLimiter);

// ─── STATIC FILES (local dev fallback & assets) ───────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets',  express.static(path.join(__dirname, 'assets')));

// ─── API ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/units',          require('./routes/units'));
app.use('/api/academic-years', require('./routes/academic-years'));
app.use('/api/teams',          require('./routes/teams'));
app.use('/api/events',         require('./routes/events'));
app.use('/api/gallery',        require('./routes/gallery'));
app.use('/api/documents',      require('./routes/documents'));
app.use('/api/administrators', require('./routes/administrators'));
app.use('/api/audit-logs',     require('./routes/audit-logs'));
app.use('/api/contact',        require('./routes/contact'));
app.use('/api/join',           require('./routes/join'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api/testimonials',   require('./routes/testimonials'));
app.use('/api/announcements',  require('./routes/announcements'));
app.use('/api/about',          require('./routes/about'));
app.use('/api/timeline',       require('./routes/timeline'));

// ─── DASHBOARD STATS API ──────────────────────────────────────────────────────
const { authenticateAdmin, requireAnyAdmin } = require('./middleware/auth');
const AdminUser     = require('./database/models/AdminUser');
const Event         = require('./database/models/Event');
const Gallery       = require('./database/models/Gallery');
const Document      = require('./database/models/Document');
const Unit          = require('./database/models/Unit');
const ContactMessage = require('./database/models/ContactMessage');
const JoinRequest   = require('./database/models/JoinRequest');

app.get('/api/stats', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const admin = req.admin;

    // Sub-Admins see only their assigned unit data
    const unitFilter = admin.role === 'MAIN_ADMIN' ? {} : { unitId: { $in: admin.assignedUnitIds } };

    const [
      totalUnits, totalEvents, totalPhotos, totalDocuments,
      totalJoinRequests, pendingJoinRequests,
      totalMessages, newMessages,
      recentEvents, recentMessages, recentJoinRequests,
    ] = await Promise.all([
      admin.role === 'MAIN_ADMIN' ? Unit.countDocuments({ status: 'Active' }) : Promise.resolve(admin.assignedUnitIds.length),
      Event.countDocuments(unitFilter),
      Gallery.countDocuments(unitFilter),
      Document.countDocuments(unitFilter),
      JoinRequest.countDocuments(unitFilter),
      JoinRequest.countDocuments({ ...unitFilter, status: 'Pending' }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'New' }),
      Event.find(unitFilter).sort({ createdAt: -1 }).limit(5).select('title date status unitId'),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5).select('name email subject status createdAt'),
      JoinRequest.find(unitFilter).sort({ createdAt: -1 }).limit(5).select('name email college status createdAt'),
    ]);

    let extraStats = {};
    if (admin.role === 'MAIN_ADMIN') {
      extraStats.totalSubAdmins = await AdminUser.countDocuments({ role: 'SUB_ADMIN' });
    }

    res.json({
      success: true,
      data: {
        totalUnits, totalEvents, totalPhotos, totalDocuments,
        totalJoinRequests, pendingJoinRequests,
        totalMessages, newMessages,
        recentEvents, recentMessages, recentJoinRequests,
        ...extraStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── API 404 FALLBACK ──────────────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ─── SOCKET.IO ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  // Allow admins to join their unit-specific rooms for targeted notifications
  socket.on('join-admin-room', (data) => {
    if (data && data.adminId) {
      socket.join(`admin-${data.adminId}`);
    }
    if (data && data.unitId) {
      socket.join(`unit-${data.unitId}`);
    }
    if (data && data.role === 'MAIN_ADMIN') {
      socket.join('main-admin');
    }
  });

  socket.on('disconnect', () => {});
});

// ─── SPA FRONTEND ──────────────────────────────────────────────────────────────
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  app.use(express.static(path.join(__dirname), { index: 'index.html' }));
  app.use((req, res) => {
    if (fs.existsSync(path.join(__dirname, 'index.html'))) {
      res.sendFile(path.join(__dirname, 'index.html'));
    } else {
      res.status(404).send('Application not built. Run: npm run build');
    }
  });
}

// ─── ERROR HANDLER ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.name === 'MulterError') return res.status(400).json({ success: false, message: err.message });
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── START ──────────────────────────────────────────────────────────────────────
async function start() {
  try {
    // Validate + initialise Nextcloud/local storage
    initStorage();

    await connectDB();

    // Developer guidance: check for Main Admin
    const mainAdminCount = await AdminUser.countDocuments({ role: 'MAIN_ADMIN' });
    if (mainAdminCount === 0) {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║  ⚠  No MAIN_ADMIN found in the database.                 ║');
      console.log('║                                                           ║');
      console.log('║  Run the following command to create the main admin:      ║');
      console.log('║                                                           ║');
      console.log('║    node scripts/seed-admin.js                             ║');
      console.log('║                                                           ║');
      console.log('║  Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in .env     ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
    }

    server.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║    MAGIC Youth Digital Platform v4.0             ║');
      console.log('╠══════════════════════════════════════════════════╣');
      console.log(`║  Server:    http://localhost:${PORT}               ║`);
      console.log('║  Auth:      JWT + httpOnly Cookies               ║');
      console.log('║  Socket.IO: Real-time + Unit rooms               ║');
      console.log('║  Storage:   Nextcloud WebDAV                     ║');
      console.log('╚══════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err.message);
    process.exit(1);
  }
}

module.exports = app;

if (require.main === module) {
  start();
}
