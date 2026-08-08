/**
 * routes/auth.js
 * Multi-admin JWT authentication.
 * MAIN_ADMIN seeded via `node scripts/seed-admin.js`.
 * SUB_ADMINs created via /api/administrators (Main Admin only).
 * NO public registration endpoint.
 */

const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const AdminUser  = require('../database/models/AdminUser');
const { authenticateAdmin } = require('../middleware/auth');

const JWT_SECRET              = process.env.JWT_SECRET || 'MagicYouth_JWT_FallbackSecret';
const JWT_EXPIRES_IN          = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REMEMBER_EXPIRES_IN = process.env.JWT_REMEMBER_EXPIRES_IN || '30d';

/**
 * POST /api/auth/login
 * Authenticate a MAIN_ADMIN or SUB_ADMIN.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (admin.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact the administrator.' });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update lastLogin
    admin.lastLogin = new Date();
    await admin.save();

    const expiresIn = rememberMe ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN;
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        email:   admin.email,
        role:    admin.role,
        name:    admin.name,
      },
      JWT_SECRET,
      { expiresIn }
    );

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    res.cookie('magicyouth_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge,
      path:     '/',
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      admin:   { id: admin._id, name: admin.name, email: admin.email, role: admin.role, assignedUnitIds: admin.assignedUnitIds },
    });
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie('magicyouth_token', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/status
 */
router.get('/status', async (req, res) => {
  const token = req.cookies?.magicyouth_token;
  if (!token) return res.json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Load fresh from DB to get current assignedUnitIds & status
    const admin = await AdminUser.findById(decoded.adminId).select('-passwordHash');
    if (!admin || admin.status === 'Inactive') return res.json({ loggedIn: false });

    return res.json({
      loggedIn: true,
      admin:    { id: admin._id, name: admin.name, email: admin.email, role: admin.role, assignedUnitIds: admin.assignedUnitIds },
    });
  } catch {
    return res.json({ loggedIn: false });
  }
});

/**
 * POST /api/auth/change-password
 */
router.post('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const admin = await AdminUser.findById(req.admin._id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });

    const match = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[AUTH CHANGE-PASSWORD ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
