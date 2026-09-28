/**
 * database/models/Program.js
 * Mongoose model for MAGIC Youth Flagship Programs & Regular Initiatives.
 */

const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Program title is required'],
    trim: true,
  },
  shortDescription: {
    type: String,
    default: '',
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
  },
  poster: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    default: 'Flagship Initiative',
    trim: true,
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Past', 'Completed', 'Draft', 'Published'],
    default: 'Ongoing',
  },
  unitId: {
    type: String,
    default: null,
  },
  academicYearId: {
    type: String,
    default: null,
  },
  startDate: {
    type: String,
    default: null,
  },
  endDate: {
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

module.exports = mongoose.models.Program || mongoose.model('Program', programSchema);
