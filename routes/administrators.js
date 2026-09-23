/**
 * routes/administrators.js
 * Admin & Sub-Admin / Lead User Management using Supabase.
 * Only Main Admin can access user management endpoints.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

// All routes require Main Admin authentication
router.use(authenticateAdmin, requireMainAdmin);

/** GET /api/administrators — List all Admin & Lead Users */
router.get('/', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, assigned_unit_ids, status, last_login_at, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch units for mapping unit names to assigned_unit_ids
    const { data: units } = await supabase.from('units').select('id, name, code');
    const unitMap = (units || []).reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    const formatted = (users || []).map(u => ({
      ...u,
      _id: u.id,
      assignedUnitIds: (u.assigned_unit_ids || []).map(uid => unitMap[uid] || { id: uid, _id: uid, name: 'Unknown Chapter', code: '' }),
      assigned_unit_ids: u.assigned_unit_ids || [],
      lastLoginAt: u.last_login_at,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/administrators/:id — Get Single User */
router.get('/:id', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, assigned_unit_ids, status, last_login_at, created_at, updated_at')
      .eq('id', req.params.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { data: units } = await supabase.from('units').select('id, name, code');
    const unitMap = (units || []).reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ...user,
        _id: user.id,
        assignedUnitIds: (user.assigned_unit_ids || []).map(uid => unitMap[uid] || { id: uid, _id: uid, name: 'Unknown Chapter', code: '' }),
        assigned_unit_ids: user.assigned_unit_ids || [],
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID.' });
  }
});

/** POST /api/administrators — Create Admin / Lead User */
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, assignedUnitIds, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with that email/username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const validRoles = ['MAIN_ADMIN', 'FIRST_LEAD', 'SECRETARY', 'SOCIAL_MEDIA', 'SUB_ADMIN'];
    const userRole = validRoles.includes(role) ? role : 'SUB_ADMIN';

    const { data: newUser, error } = await supabase
      .from('admin_users')
      .insert([{
        name: name.trim(),
        email: cleanEmail,
        password_hash: passwordHash,
        role: userRole,
        assigned_unit_ids: Array.isArray(assignedUnitIds) ? assignedUnitIds : [],
        status: status === 'Inactive' ? 'Inactive' : 'Active',
      }])
      .select('id, name, email, role, assigned_unit_ids, status, created_at')
      .single();

    if (error) throw error;

    await logAction(req, 'Create User', 'AdminUser', newUser.id, null);

    res.status(201).json({
      success: true,
      data: {
        ...newUser,
        _id: newUser.id,
        assignedUnitIds: newUser.assigned_unit_ids,
        createdAt: newUser.created_at,
      },
      message: `${userRole.replace('_', ' ')} account created successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/administrators/:id — Edit User */
router.put('/:id', async (req, res) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { name, email, role, assignedUnitIds, status } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (name) updates.name = name.trim();
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== existing.email?.toLowerCase()) {
        const { data: duplicate } = await supabase
          .from('admin_users')
          .select('id')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (duplicate && duplicate.id !== req.params.id) {
          return res.status(409).json({ success: false, message: 'An account with that email/username already exists.' });
        }
      }
      updates.email = cleanEmail;
    }
    if (role) {
      const validRoles = ['MAIN_ADMIN', 'FIRST_LEAD', 'SECRETARY', 'SOCIAL_MEDIA', 'SUB_ADMIN'];
      if (validRoles.includes(role)) updates.role = role;
    }
    if (assignedUnitIds !== undefined) {
      updates.assigned_unit_ids = Array.isArray(assignedUnitIds) ? assignedUnitIds : [];
    }
    if (status) {
      updates.status = status === 'Inactive' ? 'Inactive' : 'Active';
    }

    const { data: updated, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, name, email, role, assigned_unit_ids, status, created_at, updated_at')
      .single();

    if (error) throw error;

    await logAction(req, 'Edit User', 'AdminUser', updated.id, null);

    res.json({
      success: true,
      data: {
        ...updated,
        _id: updated.id,
        assignedUnitIds: updated.assigned_unit_ids,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
      message: 'User updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/administrators/:id/status — Enable or Disable User */
router.patch('/:id/status', async (req, res) => {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ success: false, message: 'You cannot disable your own admin account.' });
    }

    const newStatus = req.body.status === 'Active' ? 'Active' : 'Inactive';

    const { data: updated, error } = await supabase
      .from('admin_users')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('id, name, email, status')
      .single();

    if (error || !updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const action = newStatus === 'Active' ? 'Enable User' : 'Disable User';
    await logAction(req, action, 'AdminUser', updated.id, null);

    res.json({
      success: true,
      data: { ...updated, _id: updated.id },
      message: `User account has been ${newStatus === 'Active' ? 'activated' : 'disabled'}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/administrators/:id/reset-password — Reset User Password */
router.patch('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const { data: updated, error } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('id, name, email')
      .single();

    if (error || !updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await logAction(req, 'Reset User Password', 'AdminUser', updated.id, null);

    res.json({
      success: true,
      message: `Password for ${updated.name || updated.email} has been reset successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** DELETE /api/administrators/:id — Delete User Account */
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    const { data: existing, error: findError } = await supabase
      .from('admin_users')
      .select('id, name, email, role')
      .eq('id', req.params.id)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    await logAction(req, 'Delete User', 'AdminUser', existing.id, null);

    res.json({ success: true, message: `Account for ${existing.name || existing.email} has been deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
