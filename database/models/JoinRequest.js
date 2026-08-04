/**
 * database/models/JoinRequest.js
 * Mongoose model for volunteer join applications.
 */

const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  email:              { type: String, required: true, trim: true, lowercase: true },
  phone:              { type: String, required: true, trim: true },
  gender:             { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Male' },
  dob:                { type: String, default: null },
  college:            { type: String, required: true, trim: true },
  department:         { type: String, required: true, trim: true },
  year:               { type: String, required: true, trim: true },
  city:               { type: String, required: true, trim: true },
  skills:             { type: [String], default: [] },
  interests:          { type: [String], default: [] },
  previousExperience: { type: String, default: '' },
  reason:             { type: String, required: true, trim: true },
  resumeUrl:          { type: String, default: null },
  profileImage:       { type: String, default: null },
  status:             { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminNotes:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
