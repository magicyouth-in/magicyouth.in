/**
 * database/models/Testimonial.js
 * Mongoose model for client/volunteer testimonials.
 */

const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  role:      { type: String, required: true, trim: true },
  quote:     { type: String, required: true, trim: true },
  avatarUrl: { type: String, default: null },
  isFeatured:{ type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
