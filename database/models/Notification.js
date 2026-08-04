/**
 * database/models/Notification.js
 * Mongoose model for system notifications (Socket.IO + Admin Inbox).
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  message:    { type: String, default: '' },
  type:       { type: String, enum: ['info', 'success', 'warning', 'urgent', 'join_request', 'contact_message', 'event_registration', 'document', 'gallery'], default: 'info' },
  linkUrl:    { type: String, default: '' },
  isRead:     { type: Boolean, default: false },
  targetRole: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
