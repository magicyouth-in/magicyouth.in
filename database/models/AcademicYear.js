/**
 * database/models/AcademicYear.js
 * Mongoose model for academic years under MAGIC Youth Units.
 */

const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  year:   { type: String, required: true, trim: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

// Create indexes
academicYearSchema.index({ unitId: 1, year: 1 });

module.exports = mongoose.model('AcademicYear', academicYearSchema);
