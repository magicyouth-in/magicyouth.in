/**
 * middleware/memberAuth.js
 * JWT-based authentication for MAGIC Youth Member Portal.
 * Uses a separate cookie `member_token` — completely isolated from admin auth.
 */

const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');

const MEMBER_JWT_SECRET  = process.env.MEMBER_JWT_SECRET || process.env.JWT_SECRET || 'MagicYouth_Member_JWT_Secret';
const MEMBER_COOKIE_NAME = 'member_token';

function _verify(token) {
  try {
    return jwt.verify(token, MEMBER_JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * authenticateMember
 * Verifies the member_token cookie and loads the member from Supabase.
 * Attaches req.member = { id, memberId, name, email, unitId, status, ... }
 */
async function authenticateMember(req, res, next) {
  const token = req.cookies?.[MEMBER_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in as a member.' });
  }

  const decoded = _verify(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }

  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('id, member_id, name, email, unit_id, status, role_label')
      .eq('id', decoded.memberId)
      .single();

    if (error || !member) {
      return res.status(401).json({ success: false, message: 'Member account not found.' });
    }

    if (member.status !== 'Active') {
      return res.status(403).json({ success: false, message: `Your membership is ${member.status.toLowerCase()}. Please contact admin.` });
    }

    req.member = {
      ...member,
      _id:    member.id,
      unitId: member.unit_id,
    };

    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
}

/**
 * signMemberToken — creates a signed JWT for a member.
 */
function signMemberToken(member, expiresIn = '7d') {
  return jwt.sign(
    {
      memberId: member.id,
      email:    member.email,
      unitId:   member.unit_id,
      role:     'MEMBER',
    },
    MEMBER_JWT_SECRET,
    { expiresIn }
  );
}

/**
 * setMemberCookie — sets the member_token httpOnly cookie.
 */
function setMemberCookie(res, token, rememberMe = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  res.cookie(MEMBER_COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge,
    path:     '/',
  });
}

/**
 * clearMemberCookie
 */
function clearMemberCookie(res) {
  res.clearCookie(MEMBER_COOKIE_NAME, { path: '/' });
}

module.exports = { authenticateMember, signMemberToken, setMemberCookie, clearMemberCookie, MEMBER_JWT_SECRET };
