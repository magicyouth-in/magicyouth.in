/**
 * database/models/Event.js
 * Mongoose model for events.
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  date:         { type: String, default: null },
  venue:        { type: String, default: null },
  description:  { type: String, default: null },
  organizers:   { type: String, default: null },
  status:       { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
  posterImage:  { type: String, default: null },
  academicYear: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
