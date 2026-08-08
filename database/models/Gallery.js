/**
 * database/models/Gallery.js
 * Mongoose model for gallery photo metadata.
 * Actual images are stored in Nextcloud. MongoDB stores metadata only.
 */

const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  unitId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  eventId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  album:          { type: String, trim: true, default: '' },
  category:       { type: String, trim: true, default: 'General' },
  title:          { type: String, trim: true, default: '' },
  description:    { type: String, default: '' },
  filePath:       { type: String, required: true }, // Nextcloud path
  thumbnail:      { type: String, default: null },  // Nextcloud thumbnail path
}, { timestamps: true });

gallerySchema.index({ unitId: 1, academicYearId: 1 });
gallerySchema.index({ eventId: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
