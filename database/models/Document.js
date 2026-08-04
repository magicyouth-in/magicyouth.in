/**
 * database/models/Document.js
 * Mongoose model for uploaded documents / reports.
 */

const mongoose = require('mongoose');

const VALID_CATEGORIES = ['Event Reports', 'Annual Reports', 'Magazines', 'Certificates', 'Letters/Documents'];

const documentSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  eventName:      { type: String, default: null },
  eventDate:      { type: String, default: null },
  filename:       { type: String, required: true },
  description:    { type: String, default: null },
  category:       { type: String, enum: VALID_CATEGORIES, default: 'Event Reports' },
  academicYear:   { type: String, default: null },
  isDownloadable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
module.exports.VALID_CATEGORIES = VALID_CATEGORIES;
