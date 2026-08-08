/**
 * utils/auditLog.js
 * Helper to create AdminActivityLog entries.
 */

const AdminActivityLog = require('../database/models/AdminActivityLog');

/**
 * Log an admin action.
 * @param {import('express').Request} req
 * @param {string} action        - e.g. 'Create Event'
 * @param {string} resourceType  - e.g. 'Event'
 * @param {string} resourceId    - string ID of the affected resource
 * @param {string|null} unitId   - unit the resource belongs to
 */
async function logAction(req, action, resourceType, resourceId, unitId) {
  try {
    if (!req.admin) return;
    await AdminActivityLog.create({
      adminId:      req.admin._id,
      role:         req.admin.role,
      action,
      resourceType,
      resourceId:   resourceId ? resourceId.toString() : null,
      unitId:       unitId || null,
      ipAddress:    req.ip || req.connection?.remoteAddress || '',
    });
  } catch (err) {
    // Never let audit logging crash the main request
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}

module.exports = { logAction };
