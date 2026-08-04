/**
 * server.js
 * MAGIC Youth Digital Platform — Production Server
 * Express + Socket.IO + JWT Auth + MongoDB Atlas
 */

require('dotenv').config();

const express     = require('express');
const http        = require('http');
const { Server }  = require('socket.io');
const cookieParser = require('cookie-parser');
const path        = require('path');
const fs          = require('fs');
const helmet      = require('helmet');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');

const { connectDB } = require('./database/mongoose');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

app.set('io', io);

const PORT = process.env.PORT || 3000;

// ─── ENSURE UPLOAD DIRECTORIES ─────────────────────────────────────────────
const UPLOAD_DIRS = [
  'uploads/events', 'uploads/gallery', 'uploads/documents',
  'uploads/team', 'uploads/reports', 'uploads/join',
];
UPLOAD_DIRS.forEach(dir => fs.mkdirSync(path.join(__dirname, dir), { recursive: true }));

// ─── SECURITY & MIDDLEWARE ─────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter — API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// ─── STATIC FILES ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets',  express.static(path.join(__dirname, 'assets')));

// ─── API ROUTES ────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/gallery',       require('./routes/gallery'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/team',          require('./routes/team'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/timeline',      require('./routes/timeline'));
app.use('/api/contact',       require('./routes/contact'));
app.use('/api/about',         require('./routes/about'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/join',          require('./routes/join'));
app.use('/api/testimonials',  require('./routes/testimonials'));

// ─── DASHBOARD STATS API ──────────────────────────────────────────────────
const { requireAuth } = require('./middleware/auth');
const Event          = require('./database/models/Event');
const Gallery        = require('./database/models/Gallery');
const Document       = require('./database/models/Document');
const TeamMember     = require('./database/models/TeamMember');
const ContactMessage = require('./database/models/ContactMessage');
const JoinRequest    = require('./database/models/JoinRequest');

app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const [
      totalEvents, upcomingEvents, completedEvents,
      totalPhotos, totalDocuments, currentTeam,
      totalJoinRequests, pendingJoinRequests,
      totalMessages, newMessages,
      recentEvents, recentMessages, recentJoinRequests
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'upcoming' }),
      Event.countDocuments({ status: 'completed' }),
      Gallery.countDocuments(),
      Document.countDocuments(),
      TeamMember.countDocuments({ isCurrent: true }),
      JoinRequest.countDocuments(),
      JoinRequest.countDocuments({ status: 'Pending' }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'New' }),
      Event.find().sort({ createdAt: -1 }).limit(5).select('title date status'),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5).select('name email subject query createdAt status'),
      JoinRequest.find().sort({ createdAt: -1 }).limit(5).select('name email college department status createdAt')
    ]);

    res.json({
      success: true,
      data: {
        totalEvents, upcomingEvents, completedEvents,
        totalPhotos, totalDocuments, currentTeam,
        totalJoinRequests, pendingJoinRequests,
        totalMessages, newMessages,
        recentEvents, recentMessages, recentJoinRequests
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SOCKET.IO ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

// ─── SPA FRONTEND ──────────────────────────────────────────────────────────
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  app.use(express.static(path.join(__dirname), { index: 'index.html' }));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// ─── ERROR HANDLER ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── START ─────────────────────────────────────────────────────────────────
async function start() {
  try {
    await connectDB();

    // Check if admin exists — show developer guidance if not
    const AdminUser = require('./database/models/AdminUser');
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║  ⚠  No administrator account found in the database.    ║');
      console.log('║                                                        ║');
      console.log('║  Run the following command to create the admin:         ║');
      console.log('║                                                        ║');
      console.log('║    node scripts/seed-admin.js                          ║');
      console.log('║                                                        ║');
      console.log('║  This reads ADMIN_EMAIL and ADMIN_PASSWORD from .env   ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');
    }

    server.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║    MAGIC Youth Digital Platform v3.0        ║');
      console.log('╠══════════════════════════════════════════════╣');
      console.log(`║  Server:    http://localhost:${PORT}           ║`);
      console.log('║  Auth:      JWT + httpOnly Cookies           ║');
      console.log('║  Socket.IO: Real-time engine enabled         ║');
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
