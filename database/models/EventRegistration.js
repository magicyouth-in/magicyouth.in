/**
 * database/models/EventRegistration.js
 * Mongoose model for event attendee registrations.
 */

const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  eventId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventTitle:        { type: String, required: true },
  name:              { type: String, required: true, trim: true },
  email:             { type: String, required: true, trim: true, lowercase: true },
  phone:             { type: String, required: true, trim: true },
  college:           { type: String, default: '' },
  department:        { type: String, default: '' },
  year:              { type: String, default: '' },
  rollNo:            { type: String, default: '' },
  attendanceStatus:  { type: String, enum: ['Registered', 'Attended', 'Absent'], default: 'Registered' },
  certificateIssued: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
