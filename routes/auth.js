/**
 * routes/auth.js
 * Single-administrator JWT authentication.
 * NO registration endpoint. Admin is seeded via `node scripts/seed-admin.js`.
 */

const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const AdminUser  = require('../database/models/AdminUser');
const { requireAuth } = require('../middleware/auth');

const JWT_SECRET              = process.env.JWT_SECRET || 'MagicYouth_JWT_FallbackSecret';
const JWT_EXPIRES_IN          = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REMEMBER_EXPIRES_IN = process.env.JWT_REMEMBER_EXPIRES_IN || '30d';

/**
 * POST /api/auth/login
 * Authenticate the single administrator.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find admin by email OR username (backward compatible)
    const admin = await AdminUser.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: email.trim() }]
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Issue JWT
    const expiresIn = rememberMe ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN;
    const token = jwt.sign(
      { adminId: admin._id.toString(), email: admin.email, username: admin.username },
      JWT_SECRET,
      { expiresIn }
    );

    // Cookie max-age in ms
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    res.cookie('magicyouth_token', token, {
      httpOnly:  true,
      secure:    process.env.NODE_ENV === 'production',
      sameSite:  'Lax',
      maxAge:    maxAge,
      path:      '/',
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/logout
 * Clear the JWT cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie('magicyouth_token', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/status
 * Check current authentication state.
 */
router.get('/status', (req, res) => {
  const token = req.cookies?.magicyouth_token;
  if (!token) {
    return res.json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      loggedIn: true,
      admin: { id: decoded.adminId, username: decoded.username, email: decoded.email },
    });
  } catch {
    return res.json({ loggedIn: false });
  }
});

/**
 * POST /api/auth/change-password
 * Change the administrator's password. Protected.
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const admin = await AdminUser.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    const match = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[AUTH CHANGE-PASSWORD ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
