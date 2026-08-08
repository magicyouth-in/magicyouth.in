/**
 * middleware/auth.js
 * JWT-based authentication and role/unit authorization middleware.
 * Reads the token from httpOnly cookie `magicyouth_token`.
 */

const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET || 'MagicYouth_JWT_FallbackSecret';

// ─── Core JWT verification ─────────────────────────────────────────────────────

function _verify(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ─── Authenticate admin (attaches req.admin) ──────────────────────────────────

/**
 * Verifies JWT and loads the admin document from Supabase admin_users table.
 * Fails with 401 if token is missing, expired, or admin is Inactive.
 */
async function authenticateAdmin(req, res, next) {
  const token = req.cookies?.magicyouth_token;
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });

  const decoded = _verify(token);
  if (!decoded) return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });

  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, assigned_unit_ids, status')
      .eq('id', decoded.adminId)
      .single();

    if (error || !admin) return res.status(401).json({ success: false, message: 'Admin account not found.' });
    if (admin.status === 'Inactive') return res.status(403).json({ success: false, message: 'Your account has been disabled.' });

    // Standardize object fields
    req.admin = {
      ...admin,
      _id: admin.id,
      assignedUnitIds: admin.assigned_unit_ids || [],
    };

    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
}

// ─── Legacy alias used by older routes ───────────────────────────────────────

/**
 * Lightweight JWT check — does NOT load admin from DB. Kept for backward compatibility.
 * Prefer `authenticateAdmin` for new routes.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.magicyouth_token;
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });

  const decoded = _verify(token);
  if (!decoded) return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });

  req.adminId    = decoded.adminId;
  req.adminEmail = decoded.email;
  req.adminRole  = decoded.role;
  return next();
}

/**
 * Page-level redirect guard.
 */
function requireAuthPage(req, res, next) {
  const token = req.cookies?.magicyouth_token;
  if (!token) return res.redirect('/admin/login');
  const decoded = _verify(token);
  if (!decoded) return res.redirect('/admin/login');
  req.adminId    = decoded.adminId;
  req.adminEmail = decoded.email;
  return next();
}

// ─── Role guards ──────────────────────────────────────────────────────────────

/**
 * Allows only MAIN_ADMIN. Requires `authenticateAdmin` to have run first.
 */
function requireMainAdmin(req, res, next) {
  if (!req.admin) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  if (req.admin.role !== 'MAIN_ADMIN') return res.status(403).json({ success: false, message: 'Forbidden. Main administrator access required.' });
  return next();
}

/**
 * Allows any authenticated admin (MAIN_ADMIN or SUB_ADMIN). Requires `authenticateAdmin`.
 */
function requireAnyAdmin(req, res, next) {
  if (!req.admin) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  return next();
}

// ─── Unit-level authorization ────────────────────────────────────────────────

/**
 * Verifies that the logged-in admin has access to a specific unitId.
 * MAIN_ADMIN always passes.
 * SUB_ADMIN must have the unitId in their assignedUnitIds.
 *
 * Usage:
 *   router.put('/:id', authenticateAdmin, requireAnyAdmin, verifyUnitAccess('event'), handler)
 *
 * @param {string} resourceType - The resource type (e.g. 'event', 'team', 'gallery')
 *   The route handler is responsible for setting `req.resourceUnitId` BEFORE calling next()
 *   from any preceding resolver middleware, OR pass the unitId as `req.params.unitId`.
 *
 * Alternatively, call `assertUnitAccess(admin, unitId)` directly inside route handlers.
 */
function verifyUnitAccess(req, res, next) {
  const admin  = req.admin;
  const unitId = (req.resourceUnitId || req.params.unitId || '').toString();

  if (!admin) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  if (admin.role === 'MAIN_ADMIN') return next();

  const hasAccess = admin.assignedUnitIds.some(id => id.toString() === unitId);
  if (!hasAccess) return res.status(403).json({ success: false, message: 'Forbidden. You do not have access to this Unit.' });
  return next();
}

/**
 * Helper function — call directly inside route handlers after loading a resource.
 * Returns true if the admin can access the resource's unit.
 * @param {object} admin   - req.admin (loaded by authenticateAdmin)
 * @param {string} unitId  - The resource's actual unitId from MongoDB
 */
function canAccessUnit(admin, unitId) {
  if (!admin) return false;
  if (admin.role === 'MAIN_ADMIN') return true;
  return admin.assignedUnitIds.some(id => id.toString() === unitId.toString());
}

module.exports = { authenticateAdmin, requireAuth, requireAuthPage, requireMainAdmin, requireAnyAdmin, verifyUnitAccess, canAccessUnit };
