/**
 * database/models/Team.js
 * Mongoose model for leadership teams under MAGIC Youth Units and Academic Years.
 */

const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true, default: 'Executive Board' },
  unitId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  status:         { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active' },
}, { timestamps: true });

// Create indexes
teamSchema.index({ unitId: 1, academicYearId: 1 });

module.exports = mongoose.model('Team', teamSchema);
