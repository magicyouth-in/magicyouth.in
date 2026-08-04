/**
 * database/models/TeamMember.js
 * Mongoose model for team members (current and archive).
 */

const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  position:     { type: String, default: null },
  photo:        { type: String, default: null },
  department:   { type: String, default: null },
  batchYear:    { type: String, default: null },
  contact:      { type: String, default: null },
  socialLinks:  {
    instagram: { type: String, default: '' },
    linkedin:  { type: String, default: '' },
    email:     { type: String, default: '' },
  },
  teamYear:     { type: String, default: null },
  isCurrent:    { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
