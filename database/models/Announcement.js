/**
 * database/models/Announcement.js
 * Mongoose model for site-wide announcements banner.
 */

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  content:  { type: String, default: null },
  priority: { type: String, enum: ['high', 'normal', 'low'], default: 'normal' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
