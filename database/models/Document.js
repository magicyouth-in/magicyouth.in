/**
 * database/models/Document.js
 * Mongoose model for document metadata.
 * Actual files are stored in Nextcloud. MongoDB stores metadata only.
 */

const mongoose = require('mongoose');

const DOCUMENT_TYPES = [
  'Event Reports', 'Activity Reports', 'Annual Reports', 'Unit Reports',
  'Event Proposals', 'Meeting Minutes', 'Attendance Sheets', 'Certificates',
  'Notices', 'Other Documents'
];

const documentSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  description:    { type: String, default: '' },
  unitId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  eventId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  documentType:   { type: String, enum: DOCUMENT_TYPES, default: 'Other Documents' },
  filePath:       { type: String, required: true }, // Nextcloud path
  fileSize:       { type: Number, default: 0 },
  mimeType:       { type: String, default: '' },
  downloadsCount: { type: Number, default: 0 },
  visibility:     { type: String, enum: ['Public', 'Admin Only'], default: 'Public' },
}, { timestamps: true });

documentSchema.index({ unitId: 1, academicYearId: 1 });
documentSchema.index({ eventId: 1 });
documentSchema.index({ documentType: 1 });

module.exports = mongoose.model('Document', documentSchema);
module.exports.DOCUMENT_TYPES = DOCUMENT_TYPES;
