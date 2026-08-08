/**
 * database/models/AdminActivityLog.js
 * Mongoose model for system administrator audit logging.
 */

const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema({
  adminId:      { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  role:         { type: String, required: true },
  action:       { type: String, required: true }, // e.g. "Create Event", "Edit Event"
  resourceType: { type: String, required: true }, // e.g. "Event", "SubAdmin"
  resourceId:   { type: String, default: null },
  unitId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: null },
  ipAddress:    { type: String, default: '' },
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
