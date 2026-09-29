/**
 * routes/leadership-roles.js
 * Configurable Leadership Roles for MAGIC Youth chapters.
 *
 * Public:
 *   GET /api/leadership-roles — List all active leadership roles in order
 *
 * Admin:
 *   POST   /api/leadership-roles     — Add a new leadership role
 *   PUT    /api/leadership-roles/:id — Edit role / order / active state
 *   DELETE /api/leadership-roles/:id — Remove a leadership role
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');

// Default fallback roles if database table is not yet seeded
const DEFAULT_ROLES = [
  { name: 'First Lead', display_order: 1, is_active: true },
  { name: 'Second Lead', display_order: 2, is_active: true },
  { name: 'Secretary', display_order: 3, is_active: true },
  { name: 'Deputy Secretary', display_order: 4, is_active: true },
  { name: 'Procurator', display_order: 5, is_active: true },
  { name: 'Social Media Coordinator', display_order: 6, is_active: true },
  { name: 'Event Coordinator', display_order: 7, is_active: true },
  { name: 'Volunteer Coordinator', display_order: 8, is_active: true },
  { name: 'Cultural Coordinator', display_order: 9, is_active: true },
  { name: 'Communication Coordinator', display_order: 10, is_active: true },
];

/** GET /api/leadership-roles — Public list of active roles */
router.get('/', async (req, res) => {
  try {
    const { data: roles, error } = await supabase
      .from('leadership_roles')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error || !roles || roles.length === 0) {
      // Return default list if table doesn't exist or is empty
      return res.json({ success: true, data: DEFAULT_ROLES.map((r, i) => ({ ...r, id: `default-${i}`, _id: `default-${i}` })) });
    }

    const formatted = roles.map(r => ({ ...r, _id: r.id }));
    return res.json({ success: true, data: formatted });
  } catch (err) {
    return res.json({ success: true, data: DEFAULT_ROLES.map((r, i) => ({ ...r, id: `default-${i}`, _id: `default-${i}` })) });
  }
});

/** POST /api/leadership-roles — Add new role (Main Admin) */
router.post('/', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, displayOrder, isActive } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Role name is required.' });
    }

    const { data: role, error } = await supabase
      .from('leadership_roles')
      .insert([{
        name: name.trim(),
        display_order: Number.isInteger(displayOrder) ? displayOrder : 10,
        is_active: isActive !== false,
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data: { ...role, _id: role.id }, message: 'Leadership role added.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/leadership-roles/:id — Update role (Main Admin) */
router.put('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, displayOrder, isActive } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (displayOrder !== undefined) updates.display_order = displayOrder;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data: role, error } = await supabase
      .from('leadership_roles')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !role) return res.status(404).json({ success: false, message: 'Role not found.' });

    return res.json({ success: true, data: { ...role, _id: role.id }, message: 'Leadership role updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/leadership-roles/:id — Delete role (Main Admin) */
router.delete('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('leadership_roles')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ success: true, message: 'Leadership role deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
