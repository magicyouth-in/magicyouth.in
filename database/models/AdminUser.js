/**
 * database/models/AdminUser.js
 * Mongoose model for admin users.
 */

const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  email:        { type: String, trim: true, default: '' },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminUserSchema);
