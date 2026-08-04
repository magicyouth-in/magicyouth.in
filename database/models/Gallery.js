/**
 * database/models/Gallery.js
 * Mongoose model for gallery photos, grouped by event.
 */

const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  eventId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  eventName:    { type: String, required: true, trim: true },
  filename:     { type: String, required: true },
  caption:      { type: String, default: null },
  academicYear: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
