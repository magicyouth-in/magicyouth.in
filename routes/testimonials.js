/**
 * routes/testimonials.js
 * API router for stories & testimonials management using Supabase & Mongoose fallback.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const Testimonial = require('../database/models/Testimonial');
const { authenticateAdmin, requireAnyAdmin } = require('../middleware/auth');

// In-memory cache fallback if DB is temporarily offline
let memoryTestimonials = [];

/**
 * GET /api/testimonials
 * Get all testimonials/stories. (Public)
 */
router.get('/', async (req, res) => {
  try {
    // 1. Try Supabase
    const { data: supaList, error: supaErr } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!supaErr && supaList && supaList.length > 0) {
      const formatted = supaList.map(t => ({
        ...t,
        _id: t.id,
        name: t.name || t.author,
        author: t.author || t.name,
        role: t.role || t.unit,
        unit: t.unit || t.role,
        quote: t.quote || t.excerpt,
        excerpt: t.excerpt || t.quote,
        fullStory: t.full_story || t.fullStory || t.quote,
        category: t.category || 'Student Experience',
        tag: t.tag || 'Verified Story',
        isFeatured: t.is_featured ?? t.isFeatured ?? false,
      }));
      return res.json({ success: true, data: formatted });
    }

    // 2. Fallback to Mongoose
    try {
      const list = await Testimonial.find().sort({ createdAt: -1 });
      if (list && list.length > 0) {
        return res.json({ success: true, data: list });
      }
    } catch {}

    // 3. Fallback to memory
    res.json({ success: true, data: memoryTestimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: memoryTestimonials });
  }
});

/**
 * POST /api/testimonials
 * Create new story/testimonial. (Admin)
 */
router.post('/', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { title, name, author, role, unit, quote, excerpt, fullStory, category, tag, isFeatured } = req.body;
    const finalAuthor = name || author;
    const finalRole = role || unit || 'Student Lead';
    const finalQuote = quote || excerpt;
    const finalTitle = title || `Transformation Story by ${finalAuthor}`;

    if (!finalAuthor || !finalQuote) {
      return res.status(400).json({ success: false, message: 'Author name and story quote/excerpt are required.' });
    }

    const newObj = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: finalTitle,
      name: finalAuthor,
      author: finalAuthor,
      role: finalRole,
      unit: finalRole,
      quote: finalQuote,
      excerpt: finalQuote,
      full_story: fullStory || finalQuote,
      fullStory: fullStory || finalQuote,
      category: category || 'Student Experience',
      tag: tag || 'Verified Story',
      is_featured: !!isFeatured,
      isFeatured: !!isFeatured,
      created_at: new Date().toISOString()
    };

    // 1. Try Supabase insert
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([{
          title: finalTitle,
          name: finalAuthor,
          role: finalRole,
          quote: finalQuote,
          category: category || 'Student Experience',
          tag: tag || 'Verified Story',
          is_featured: !!isFeatured,
          full_story: fullStory || finalQuote,
        }])
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json({
          success: true,
          message: 'Story created successfully.',
          data: { ...data, _id: data.id, author: data.name, unit: data.role, excerpt: data.quote, fullStory: data.full_story || data.quote }
        });
      }
    } catch {}

    // 2. Fallback to Mongoose
    try {
      const item = new Testimonial({
        name: finalAuthor,
        role: finalRole,
        quote: finalQuote,
        isFeatured: !!isFeatured
      });
      await item.save();
      return res.status(201).json({ success: true, message: 'Story created.', data: { ...newObj, _id: item._id } });
    } catch {}

    // 3. Fallback to memory
    memoryTestimonials.unshift({ ...newObj, _id: newObj.id });
    res.status(201).json({ success: true, message: 'Story created successfully.', data: { ...newObj, _id: newObj.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/testimonials/:id
 * Update story/testimonial. (Admin)
 */
router.put('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    const { title, name, author, role, unit, quote, excerpt, fullStory, category, tag, isFeatured } = req.body;
    const finalAuthor = name || author;
    const finalRole = role || unit;
    const finalQuote = quote || excerpt;

    // 1. Try Supabase
    try {
      const updates = { updated_at: new Date().toISOString() };
      if (title) updates.title = title;
      if (finalAuthor) updates.name = finalAuthor;
      if (finalRole) updates.role = finalRole;
      if (finalQuote) updates.quote = finalQuote;
      if (fullStory) updates.full_story = fullStory;
      if (category) updates.category = category;
      if (tag) updates.tag = tag;
      if (isFeatured !== undefined) updates.is_featured = !!isFeatured;

      const { data, error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (!error && data) {
        return res.json({
          success: true,
          message: 'Story updated successfully.',
          data: { ...data, _id: data.id, author: data.name, unit: data.role, excerpt: data.quote, fullStory: data.full_story || data.quote }
        });
      }
    } catch {}

    // 2. Try Mongoose
    try {
      const item = await Testimonial.findById(req.params.id);
      if (item) {
        if (finalAuthor) item.name = finalAuthor;
        if (finalRole) item.role = finalRole;
        if (finalQuote) item.quote = finalQuote;
        if (isFeatured !== undefined) item.isFeatured = !!isFeatured;
        await item.save();
        return res.json({ success: true, message: 'Story updated.', data: item });
      }
    } catch {}

    // 3. Fallback memory
    const idx = memoryTestimonials.findIndex(m => m._id === req.params.id || m.id === req.params.id);
    if (idx !== -1) {
      memoryTestimonials[idx] = {
        ...memoryTestimonials[idx],
        title: title || memoryTestimonials[idx].title,
        author: finalAuthor || memoryTestimonials[idx].author,
        name: finalAuthor || memoryTestimonials[idx].name,
        role: finalRole || memoryTestimonials[idx].role,
        unit: finalRole || memoryTestimonials[idx].unit,
        quote: finalQuote || memoryTestimonials[idx].quote,
        excerpt: finalQuote || memoryTestimonials[idx].excerpt,
        fullStory: fullStory || memoryTestimonials[idx].fullStory,
        category: category || memoryTestimonials[idx].category,
        tag: tag || memoryTestimonials[idx].tag,
        isFeatured: isFeatured !== undefined ? !!isFeatured : memoryTestimonials[idx].isFeatured,
      };
      return res.json({ success: true, message: 'Story updated.', data: memoryTestimonials[idx] });
    }

    res.status(404).json({ success: false, message: 'Story not found.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/testimonials/:id
 * Delete story. (Admin)
 */
router.delete('/:id', authenticateAdmin, requireAnyAdmin, async (req, res) => {
  try {
    // 1. Try Supabase
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', req.params.id);
      if (!error) return res.json({ success: true, message: 'Story deleted successfully.' });
    } catch {}

    // 2. Try Mongoose
    try {
      const item = await Testimonial.findByIdAndDelete(req.params.id);
      if (item) return res.json({ success: true, message: 'Story deleted successfully.' });
    } catch {}

    // 3. Fallback memory
    memoryTestimonials = memoryTestimonials.filter(m => m._id !== req.params.id && m.id !== req.params.id);
    res.json({ success: true, message: 'Story deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
