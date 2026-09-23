/**
 * database/models/Story.js
 * Mongoose model for MAGIC Youth Stories & Testimonials.
 */

const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Story title is required'],
    trim: true,
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Story content is required'],
  },
  impact: {
    type: String,
    default: '',
    trim: true,
  },
  academicYear: {
    type: String,
    default: '',
    trim: true,
  },
  academicYearId: {
    type: String,
    default: null,
  },
  chapter: {
    type: String,
    default: '',
    trim: true,
  },
  unitId: {
    type: String,
    default: null,
  },
  program: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Published',
  },
  author: {
    type: String,
    default: 'MAGIC Youth',
    trim: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.models.Story || mongoose.model('Story', storySchema);
