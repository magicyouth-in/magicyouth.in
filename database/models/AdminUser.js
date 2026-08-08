/**
 * database/models/AdminUser.js
 * Mongoose model for system administrators.
 */

const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash:    { type: String, required: true },
  role:            { type: String, enum: ['MAIN_ADMIN', 'SUB_ADMIN'], default: 'SUB_ADMIN' },
  assignedUnitIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
  status:          { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastLogin:       { type: Date, default: null },
}, { timestamps: true });

// Indexes are created automatically for fields with unique: true

module.exports = mongoose.model('AdminUser', adminUserSchema);
