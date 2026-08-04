/**
 * database/models/ContactMessage.js
 * Mongoose model for visitor contact submissions.
 */

const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, trim: true, lowercase: true },
  phone:      { type: String, default: '' },
  subject:    { type: String, default: 'General Inquiry' },
  query:      { type: String, required: true, trim: true },
  status:     { type: String, enum: ['New', 'Read', 'Replied'], default: 'New' },
  adminReply: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
