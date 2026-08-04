/**
 * database/models/Timeline.js
 * Mongoose model for the MAGIC Youth activity timeline / journey archive.
 */

const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  eventId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  eventName:    { type: String, required: true, trim: true },
  eventDate:    { type: String, default: null },
  description:  { type: String, default: null },
  photos:       { type: [String], default: [] },   // array of gallery filenames
  documentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  academicYear: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Timeline', timelineSchema);
