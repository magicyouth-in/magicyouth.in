/**
 * database/models/Event.js
 * Mongoose model for events, linked to a Unit and Academic Year.
 */

const mongoose = require('mongoose');

const EVENT_STATUSES = ['Upcoming', 'Ongoing', 'Completed'];
const EVENT_CATEGORIES = [
  'Program', 'Workshop', 'Seminar', 'Outreach', 'Community Service',
  'Awareness', 'Leadership', 'Competition', 'Cultural', 'Training', 'Other'
];

const eventSchema = new mongoose.Schema({
  title:               { type: String, required: true, trim: true },
  description:         { type: String, default: '' },
  unitId:              { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  academicYearId:      { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  category:            { type: String, enum: EVENT_CATEGORIES, default: 'Other' },
  status:              { type: String, enum: EVENT_STATUSES, default: 'Upcoming' },
  date:                { type: String, default: null },
  startTime:           { type: String, default: null },
  endTime:             { type: String, default: null },
  location:            { type: String, default: '' },
  poster:              { type: String, default: null },  // Nextcloud file path
  photos:              [{ type: String }],               // Nextcloud file paths
  registrationEnabled: { type: Boolean, default: false },
  organizers:          { type: String, default: '' },
}, { timestamps: true });

eventSchema.index({ unitId: 1, academicYearId: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
module.exports.EVENT_STATUSES   = EVENT_STATUSES;
module.exports.EVENT_CATEGORIES = EVENT_CATEGORIES;
