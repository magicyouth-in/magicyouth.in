/**
 * routes/member-auth.js
 * Member Portal authentication — login, logout, status, change-password.
 * Completely separate from /api/auth (admin auth).
 */

const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const supabase  = require('../utils/supabaseClient');
const {
  authenticateMember,
  signMemberToken,
  setMemberCookie,
  clearMemberCookie,
} = require('../middleware/memberAuth');

/**
 * POST /api/member/auth/login
 * Body: { memberId, password, rememberMe? }
 */
router.post('/login', async (req, res) => {
  try {
    const { memberId, password, rememberMe } = req.body;

    if (!memberId || !password) {
      return res.status(400).json({ success: false, message: 'Member ID and password are required.' });
    }

    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('member_id', memberId.trim().toUpperCase())
      .single();

    if (error || !member) {
      return res.status(401).json({ success: false, message: 'Invalid Member ID or password.' });
    }

    if (member.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Your membership is ${member.status.toLowerCase()}. Please contact your unit admin.`,
      });
    }

    const match = await bcrypt.compare(password, member.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid Member ID or password.' });
    }

    // Update last_login_at
    await supabase
      .from('members')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', member.id);

    const token = signMemberToken(member, rememberMe ? '30d' : '7d');
    setMemberCookie(res, token, rememberMe);

    // Fetch unit name
    let unitName = '';
    if (member.unit_id) {
      const { data: unit } = await supabase.from('units').select('name, code').eq('id', member.unit_id).single();
      unitName = unit?.name || '';
    }

    return res.json({
      success: true,
      message: 'Login successful.',
      member: {
        id:          member.id,
        memberId:    member.member_id,
        name:        member.name,
        email:       member.email,
        unitId:      member.unit_id,
        unitName,
        status:      member.status,
        roleLabel:   member.role_label,
        profilePhoto: member.profile_photo,
      },
    });
  } catch (err) {
    console.error('[MEMBER LOGIN ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

/**
 * POST /api/member/auth/logout
 */
router.post('/logout', (req, res) => {
  clearMemberCookie(res);
  return res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/member/auth/status
 */
router.get('/status', async (req, res) => {
  const token = req.cookies?.member_token;
  if (!token) return res.json({ loggedIn: false });

  try {
    const jwt      = require('jsonwebtoken');
    const { MEMBER_JWT_SECRET } = require('../middleware/memberAuth');
    const decoded  = jwt.verify(token, MEMBER_JWT_SECRET);

    const { data: member, error } = await supabase
      .from('members')
      .select('id, member_id, name, email, unit_id, status, role_label, profile_photo')
      .eq('id', decoded.memberId)
      .single();

    if (error || !member || member.status !== 'Active') return res.json({ loggedIn: false });

    let unitName = '';
    if (member.unit_id) {
      const { data: unit } = await supabase.from('units').select('name, code').eq('id', member.unit_id).single();
      unitName = unit?.name || '';
    }

    return res.json({
      loggedIn: true,
      member: {
        id:          member.id,
        memberId:    member.member_id,
        name:        member.name,
        email:       member.email,
        unitId:      member.unit_id,
        unitName,
        status:      member.status,
        roleLabel:   member.role_label,
        profilePhoto: member.profile_photo,
      },
    });
  } catch {
    return res.json({ loggedIn: false });
  }
});

/**
 * POST /api/member/auth/change-password
 * Requires member to be authenticated.
 */
router.post('/change-password', authenticateMember, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const { data: member, error } = await supabase
      .from('members')
      .select('id, password_hash')
      .eq('id', req.member.id)
      .single();

    if (error || !member) return res.status(404).json({ success: false, message: 'Member not found.' });

    const match = await bcrypt.compare(currentPassword, member.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await supabase
      .from('members')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', member.id);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[MEMBER CHANGE-PASSWORD ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
