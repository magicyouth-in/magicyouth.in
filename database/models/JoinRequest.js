/**
 * database/models/JoinRequest.js
 * Mongoose model for join applications, linked to a Unit and Academic Year.
 */

const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, trim: true, lowercase: true },
  phone:            { type: String, required: true, trim: true },
  gender:           { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Male' },
  dob:              { type: String, default: null },
  college:          { type: String, required: true, trim: true },
  department:       { type: String, required: true, trim: true },
  year:             { type: String, required: true, trim: true },
  city:             { type: String, required: true, trim: true },
  unitId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', default: null },
  academicYearId:   { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', default: null },
  skills:           { type: [String], default: [] },
  interests:        { type: [String], default: [] },
  previousExperience: { type: String, default: '' },
  reason:           { type: String, required: true, trim: true },
  resumePath:       { type: String, default: null },    // Nextcloud path
  profileImagePath: { type: String, default: null },   // Nextcloud path
  status:           { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminNotes:       { type: String, default: '' },
}, { timestamps: true });

joinRequestSchema.index({ unitId: 1, academicYearId: 1 });
joinRequestSchema.index({ status: 1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
