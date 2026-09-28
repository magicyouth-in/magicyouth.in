/**
 * routes/auth.js
 * Multi-admin JWT authentication using Supabase.
 * MAIN_ADMIN seeded via `node scripts/seed-admin.js`.
 * NO public registration endpoint.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin } = require('../middleware/auth');

const JWT_SECRET              = process.env.JWT_SECRET || 'MagicYouth_JWT_FallbackSecret';
const JWT_EXPIRES_IN          = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REMEMBER_EXPIRES_IN = process.env.JWT_REMEMBER_EXPIRES_IN || '30d';

/**
 * POST /api/auth/login
 * Authenticate an Admin (MAIN_ADMIN or SUB_ADMIN).
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const searchEmail = email.toLowerCase().trim();
    console.log(`[AUTH] Login attempt received for: ${searchEmail}`);

    // Query Supabase admin_users
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', searchEmail)
      .single();

    if (error || !admin) {
      console.log(`[AUTH] User lookup failed for: ${searchEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    console.log(`[AUTH] User lookup succeeded: ${admin.email} (Role: ${admin.role}, Status: ${admin.status})`);

    if (admin.status === 'Inactive') {
      console.log(`[AUTH] Login rejected: Account inactive for ${admin.email}`);
      return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact the administrator.' });
    }

    if (!admin.password_hash) {
      console.log(`[AUTH] Login failed: No password hash for ${admin.email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    let match = false;
    try {
      match = await bcrypt.compare(password, admin.password_hash);
    } catch (cmpErr) {
      console.error(`[AUTH] Password comparison error for ${admin.email}:`, cmpErr.message);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!match) {
      console.log(`[AUTH] Password comparison failed for: ${admin.email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    console.log(`[AUTH] Password comparison verified successfully for: ${admin.email}`);

    // Update last_login_at
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    const expiresIn = rememberMe ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN;
    let token;
    try {
      token = jwt.sign(
        {
          adminId: admin.id,
          email:   admin.email,
          role:    admin.role,
          name:    admin.name,
        },
        JWT_SECRET,
        { expiresIn }
      );
      console.log(`[AUTH] JWT generated successfully for: ${admin.email}`);
    } catch (jwtErr) {
      console.error(`[AUTH] JWT signing failed:`, jwtErr.message);
      return res.status(500).json({ success: false, message: 'Authentication token generation failed.' });
    }

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    res.cookie('magicyouth_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge,
      path:     '/',
    });

    console.log(`[AUTH] Cookie set successfully for: ${admin.email}`);

    return res.json({
      success: true,
      message: 'Login successful.',
      admin:   { id: admin.id, name: admin.name, email: admin.email, role: admin.role, assignedUnitIds: admin.assigned_unit_ids || [] },
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
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, assigned_unit_ids, status')
      .eq('id', decoded.adminId)
      .single();

    if (error || !admin || admin.status === 'Inactive') return res.json({ loggedIn: false });

    return res.json({
      loggedIn: true,
      admin:    { id: admin.id, name: admin.name, email: admin.email, role: admin.role, assignedUnitIds: admin.assigned_unit_ids || [] },
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

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, password_hash')
      .eq('id', req.admin.id)
      .single();

    if (error || !admin) return res.status(404).json({ success: false, message: 'Admin not found.' });

    const match = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await supabase
      .from('admin_users')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', admin.id);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[AUTH CHANGE-PASSWORD ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
