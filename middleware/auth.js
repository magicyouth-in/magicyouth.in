/**
 * middleware/auth.js
 * JWT-based authentication guards for MAGIC Youth admin routes.
 * Reads the token from httpOnly cookie `magicyouth_token`.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'MagicYouth_JWT_FallbackSecret';

/**
 * Middleware for protecting API routes.
 * Returns 401 JSON if JWT is missing or invalid.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.magicyouth_token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId    = decoded.adminId;
    req.adminEmail = decoded.email;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in.' });
  }
}

/**
 * Middleware for protecting HTML admin pages.
 * Redirects to login page if JWT is missing or invalid.
 */
function requireAuthPage(req, res, next) {
  const token = req.cookies?.magicyouth_token;

  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId    = decoded.adminId;
    req.adminEmail = decoded.email;
    return next();
  } catch {
    return res.redirect('/admin/login');
  }
}

module.exports = { requireAuth, requireAuthPage };
