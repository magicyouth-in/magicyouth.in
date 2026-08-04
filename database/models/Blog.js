/**
 * database/models/Blog.js
 * Mongoose model for News, Announcements, and Achievements articles.
 */

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  slug:       { type: String, required: true, unique: true },
  content:    { type: String, required: true },
  excerpt:    { type: String, default: '' },
  author:     { type: String, default: 'MAGIC Youth Team' },
  category:   { type: String, enum: ['Announcement', 'Achievement', 'News', 'Story', 'Event Recap'], default: 'News' },
  coverImage: { type: String, default: null },
  isPublished:{ type: Boolean, default: true },
  views:      { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
