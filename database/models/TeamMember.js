/**
 * database/models/TeamMember.js
 * Mongoose model for team members, linked to a Team.
 */

const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  position:     { type: String, required: true, trim: true },
  teamId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  biography:    { type: String, default: '' },
  photo:        { type: String, default: null },
  department:   { type: String, default: '' },
  batchYear:    { type: String, default: '' },
  socialLinks: {
    instagram: { type: String, default: '' },
    linkedin:  { type: String, default: '' },
    email:     { type: String, default: '' },
  },
  displayOrder: { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

teamMemberSchema.index({ teamId: 1, displayOrder: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
