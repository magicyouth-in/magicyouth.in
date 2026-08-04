/**
 * database/models/AboutContent.js
 * Mongoose model for editable About page content sections.
 */

const mongoose = require('mongoose');

const aboutContentSchema = new mongoose.Schema({
  sectionKey:   { type: String, required: true, unique: true, trim: true, lowercase: true },
  title:        { type: String, required: true },
  content:      { type: String, default: '' },
  icon:         { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('AboutContent', aboutContentSchema);
