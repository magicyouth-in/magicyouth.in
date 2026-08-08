/**
 * database/models/Unit.js
 * Mongoose model for MAGIC Youth Units.
 */

const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  code:        { type: String, required: true, unique: true, trim: true },
  institution: { type: String, trim: true, default: '' },
  location:    { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  logo:        { type: String, default: null },
  status:      { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active' },
}, { timestamps: true });

// Indexes are created automatically for fields with unique: true

module.exports = mongoose.model('Unit', unitSchema);
