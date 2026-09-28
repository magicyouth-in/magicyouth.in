/**
 * database/models/Impact.js
 * Mongoose model for MAGIC Youth Verified Impact Outcomes & Metrics.
 */

const mongoose = require('mongoose');

const impactSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Impact title / metric label is required'],
    trim: true,
  },
  metricValue: {
    type: String,
    required: [true, 'Numeric value is required (e.g. 21, 4, 150+)'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  poster: {
    type: String,
    default: null,
  },
  unitId: {
    type: String,
    default: null,
  },
  academicYearId: {
    type: String,
    default: null,
  },
  programId: {
    type: String,
    default: null,
  },
  eventId: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['Published', 'Draft', 'Archived'],
    default: 'Published',
  },
  date: {
    type: String,
    default: null,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.models.Impact || mongoose.model('Impact', impactSchema);
