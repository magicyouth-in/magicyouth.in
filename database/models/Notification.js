/**
 * database/models/Notification.js
 * Mongoose model for system notifications with unit-aware routing.
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type:             { type: String, enum: ['info', 'success', 'warning', 'urgent', 'join_request', 'contact_message', 'event_registration', 'document', 'gallery'], default: 'info' },
  title:            { type: String, required: true, trim: true },
  message:          { type: String, default: '' },
  entityType:       { type: String, default: '' },
  entityId:         { type: String, default: null },
  unitId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: null },
  recipientAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  isRead:           { type: Boolean, default: false },
  linkUrl:          { type: String, default: '' },
}, { timestamps: true });

notificationSchema.index({ recipientAdminId: 1, isRead: 1 });
notificationSchema.index({ unitId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
