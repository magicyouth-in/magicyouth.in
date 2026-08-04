/**
 * routes/testimonials.js
 * API router for testimonials management.
 */

const express = require('express');
const router = express.Router();
const Testimonial = require('../database/models/Testimonial');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/testimonials
 * Get all testimonials. (Public)
 */
router.get('/', async (req, res) => {
  try {
    const list = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/testimonials
 * Create new testimonial. (Protected)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, role, quote, isFeatured } = req.body;
    if (!name || !role || !quote) {
      return res.status(400).json({ success: false, message: 'Name, role, and quote are required.' });
    }

    const item = new Testimonial({ name, role, quote, isFeatured: !!isFeatured });
    await item.save();

    res.status(201).json({ success: true, message: 'Testimonial created successfully.', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/testimonials/:id
 * Update testimonial. (Protected)
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, role, quote, isFeatured } = req.body;
    const item = await Testimonial.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    if (name) item.name = name;
    if (role) item.role = role;
    if (quote) item.quote = quote;
    if (isFeatured !== undefined) item.isFeatured = !!isFeatured;

    await item.save();
    res.json({ success: true, message: 'Testimonial updated successfully.', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/testimonials/:id
 * Delete testimonial. (Protected)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
