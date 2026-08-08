/**
 * utils/auditLog.js
 * Helper to create admin_activity_logs entries in Supabase PostgreSQL.
 */

const supabase = require('./supabaseClient');

/**
 * Log an admin action.
 */
async function logAction(req, action, resourceType, resourceId, unitId) {
  try {
    if (!req.admin) return;

    let cleanUnitId = unitId;
    if (cleanUnitId && (cleanUnitId.toString().length !== 36)) {
      cleanUnitId = null;
    }

    let cleanAdminId = req.admin.id || req.admin._id;

    await supabase.from('admin_activity_logs').insert([{
      admin_id: cleanAdminId,
      role: req.admin.role || 'MAIN_ADMIN',
      action,
      resource_type: resourceType,
      resource_id: resourceId ? resourceId.toString() : null,
      unit_id: cleanUnitId,
      ip_address: req.ip || req.connection?.remoteAddress || '',
    }]);
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}

module.exports = { logAction };
