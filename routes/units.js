/**
 * routes/units.js
 * CRUD for MAGIC Youth Units using Supabase PostgreSQL.
 * Supports default unit selection, active/upcoming status, and full unit attributes.
 * Hardened with CDN caching headers, in-memory caching, query timeout safeguards, and stale fallback.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/auditLog');

/** Explicit public/admin unit columns required by frontend components */
const UNIT_SELECT_COLUMNS = 'id, name, code, institution, location, description, logo, status, is_default, contact_email, contact_phone, created_at, updated_at';

// Baseline chartered units if database is temporarily unavailable or in migration
const DEFAULT_UNITS = [
  {
    id: 'c1a70001-0000-4000-8000-000000000001',
    _id: 'c1a70001-0000-4000-8000-000000000001',
    name: 'Andhra Loyola Institute of Engineering and Technology',
    code: 'ALIET',
    institution: 'Andhra Loyola Institute of Engineering and Technology',
    location: 'Vijayawada, Andhra Pradesh',
    description: 'Chartered campus unit at ALIET fostering innovation, youth leadership, and community service.',
    logo: null,
    status: 'Active',
    is_default: true,
    isDefault: true,
    contact_email: 'aliet@magicyouth.org',
    contact_phone: '+91 98765 43210',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'c1a70002-0000-4000-8000-000000000002',
    _id: 'c1a70002-0000-4000-8000-000000000002',
    name: 'Andhra Loyola College',
    code: 'ALC',
    institution: 'Andhra Loyola College',
    location: 'Vijayawada, Andhra Pradesh',
    description: 'Flagship collegiate chapter at ALC coordinating student outreach and social empowerment initiatives.',
    logo: null,
    status: 'Active',
    is_default: false,
    isDefault: false,
    contact_email: 'alc@magicyouth.org',
    contact_phone: '+91 98765 43211',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }
];

/** Module-scoped in-memory cache for fast chapter retrieval with stale-while-revalidate fallback */
let unitsMemoryCache = {
  publicData: null,
  allData: null,
  publicTimestamp: 0,
  allTimestamp: 0,
};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

/** Helper to invalidate in-memory cache on administrative modifications */
const invalidateUnitsCache = () => {
  unitsMemoryCache.publicData = null;
  unitsMemoryCache.allData = null;
  unitsMemoryCache.publicTimestamp = 0;
  unitsMemoryCache.allTimestamp = 0;
};

/** Helper to check if a unit is active (case-insensitive) */
const isActiveUnit = (u) => {
  const s = String(u.status || '').toLowerCase();
  return s === 'active' || s === '';
};

/** GET /api/units/default — Get the current default unit */
router.get('/default', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  try {
    // 1. Try to find unit where is_default = true and status is Active
    let { data: defaultUnit, error } = await supabase
      .from('units')
      .select(UNIT_SELECT_COLUMNS)
      .eq('is_default', true)
      .maybeSingle();

    // If defaultUnit found and is active, return it
    if (defaultUnit && isActiveUnit(defaultUnit)) {
      return res.json({ success: true, data: { ...defaultUnit, _id: defaultUnit.id, isDefault: true } });
    }

    // 2. Fallback to any Active unit ordered by name
    const { data: allUnits } = await supabase
      .from('units')
      .select(UNIT_SELECT_COLUMNS)
      .order('name', { ascending: true });

    const activeFallback = (allUnits || []).find(isActiveUnit) || allUnits?.[0] || null;

    if (activeFallback) {
      return res.json({ success: true, data: { ...activeFallback, _id: activeFallback.id, isDefault: !!activeFallback.is_default } });
    }

    // Fallback to chartered default unit
    return res.json({ success: true, data: DEFAULT_UNITS[0], isFallback: true });
  } catch (err) {
    console.warn('[UNITS DEFAULT] Serving fallback default unit due to database error:', err.message);
    return res.json({ success: true, data: DEFAULT_UNITS[0], isFallback: true });
  }
});

/** GET /api/units — Public list with status filter and caching */
router.get('/', async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';

  // Set HTTP Cache-Control headers: 5-min CDN cache for public chapter requests
  if (!includeInactive) {
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  } else {
    res.set('Cache-Control', 'private, no-cache');
  }

  const now = Date.now();
  // Return valid in-memory cache if fresh
  if (!includeInactive && unitsMemoryCache.publicData && (now - unitsMemoryCache.publicTimestamp < CACHE_TTL_MS)) {
    return res.json({ success: true, data: unitsMemoryCache.publicData });
  }
  if (includeInactive && unitsMemoryCache.allData && (now - unitsMemoryCache.allTimestamp < CACHE_TTL_MS)) {
    return res.json({ success: true, data: unitsMemoryCache.allData });
  }

  try {
    // Query Supabase with a 5000ms safeguard timeout to prevent hanging on serverless
    const queryPromise = supabase
      .from('units')
      .select(UNIT_SELECT_COLUMNS)
      .order('name', { ascending: true });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase query timed out after 5000ms')), 5000)
    );

    const { data: units, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) throw error;

    let list = units && units.length > 0 ? units : DEFAULT_UNITS;

    // Filter inactive units unless explicitly requested (e.g. by admin)
    if (!includeInactive) {
      list = list.filter(u => {
        const s = String(u.status || '').toLowerCase();
        return s === 'active' || s === 'upcoming' || s === '';
      });
    }

    // Sort default unit to the very top, then alphabetically by name
    list.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    const formatted = list.map(u => ({
      ...u,
      _id: u.id || u._id,
      isDefault: !!(u.is_default || u.isDefault),
      // Normalize status display casing
      status: String(u.status || '').toLowerCase() === 'upcoming' ? 'Upcoming' :
              String(u.status || '').toLowerCase() === 'inactive' ? 'Inactive' :
              String(u.status || '').toLowerCase() === 'archived' ? 'Archived' : 'Active'
    }));

    // Update in-memory cache
    if (!includeInactive && formatted.length > 0) {
      unitsMemoryCache.publicData = formatted;
      unitsMemoryCache.publicTimestamp = now;
    } else if (includeInactive && formatted.length > 0) {
      unitsMemoryCache.allData = formatted;
      unitsMemoryCache.allTimestamp = now;
    }

    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('[UNITS GET ERROR]', err.message);

    // Stale-data fallback: if Supabase fails or times out, serve previously cached data
    if (!includeInactive && unitsMemoryCache.publicData && unitsMemoryCache.publicData.length > 0) {
      console.warn('[UNITS GET] Serving stale units cache due to Supabase error/timeout.');
      return res.json({ success: true, data: unitsMemoryCache.publicData, isStale: true });
    }

    // Baseline chartered units fallback (mirrors routes/leadership-roles.js) so applicants are never blocked
    console.warn('[UNITS GET] Serving default fallback units due to database error/timeout.');
    const fallbackList = includeInactive ? DEFAULT_UNITS : DEFAULT_UNITS.filter(isActiveUnit);
    return res.json({ success: true, data: fallbackList, isFallback: true });
  }
});

/** GET /api/units/:id — Public detail */
router.get('/:id', async (req, res) => {
  try {
    const { data: unit, error } = await supabase.from('units').select('*').eq('id', req.params.id).single();
    if (unit) {
      return res.json({ success: true, data: { ...unit, _id: unit.id, isDefault: !!unit.is_default } });
    }
    const fallback = DEFAULT_UNITS.find(u => u.id === req.params.id || u._id === req.params.id);
    if (fallback) {
      return res.json({ success: true, data: fallback, isFallback: true });
    }
    return res.status(404).json({ success: false, message: 'Unit not found.' });
  } catch (err) {
    const fallback = DEFAULT_UNITS.find(u => u.id === req.params.id || u._id === req.params.id);
    if (fallback) {
      return res.json({ success: true, data: fallback, isFallback: true });
    }
    res.status(400).json({ success: false, message: 'Invalid unit ID.' });
  }
});

/** PATCH /api/units/:id/set-default — Set this unit as global default */
router.patch('/:id/set-default', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const unitId = req.params.id;

    // Check if unit exists
    const { data: targetUnit, error: checkError } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single();

    if (checkError || !targetUnit) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    // Unset default from all other units
    try {
      await supabase
        .from('units')
        .update({ is_default: false })
        .neq('id', unitId);
    } catch (e) {
      // non-fatal if is_default column is in migration
    }

    // Set default on target unit
    const { data: updated, error: updateError } = await supabase
      .from('units')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', unitId)
      .select()
      .single();

    if (updateError) throw updateError;

    invalidateUnitsCache();
    await logAction(req, 'Set Default Unit', 'Unit', unitId, unitId);
    return res.json({
      success: true,
      message: `Default unit set to ${updated.name}.`,
      data: { ...updated, _id: updated.id, isDefault: true }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/units — Create (Main Admin only) */
router.post('/', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, code, institution, location, description, status, isDefault } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required.' });

    if (isDefault) {
      try {
        await supabase.from('units').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {}
    }

    const { data: unit, error } = await supabase
      .from('units')
      .insert([{
        name: name.trim(),
        code: code.trim().toUpperCase(),
        institution: institution || '',
        location: location || '',
        description: description || '',
        status: status || 'Active',
        is_default: !!isDefault,
      }])
      .select()
      .single();

    if (error) throw error;

    invalidateUnitsCache();
    await logAction(req, 'Create Unit', 'Unit', unit.id, unit.id);
    res.status(201).json({ success: true, data: { ...unit, _id: unit.id, isDefault: !!unit.is_default }, message: 'Unit created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/units/:id — Edit (Main Admin only) */
router.put('/:id', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { name, code, institution, location, description, status, isDefault } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (code !== undefined) updates.code = code.trim().toUpperCase();
    if (institution !== undefined) updates.institution = institution;
    if (location !== undefined) updates.location = location;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    if (isDefault !== undefined) {
      updates.is_default = !!isDefault;
      if (isDefault) {
        try {
          await supabase.from('units').update({ is_default: false }).neq('id', req.params.id);
        } catch (e) {}
      }
    }

    const { data: unit, error } = await supabase
      .from('units')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    invalidateUnitsCache();
    await logAction(req, 'Edit Unit', 'Unit', unit.id, unit.id);
    res.json({ success: true, data: { ...unit, _id: unit.id, isDefault: !!unit.is_default }, message: 'Unit updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/units/:id/status — Toggle status */
router.patch('/:id/status', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Active', 'Upcoming', 'Inactive', 'Archived'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
    }

    const { data: unit, error } = await supabase
      .from('units')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    invalidateUnitsCache();
    await logAction(req, `Set Unit Status ${status}`, 'Unit', unit.id, unit.id);
    res.json({ success: true, message: `Unit status set to ${status}.`, data: { ...unit, _id: unit.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/units/:id/archive */
router.patch('/:id/archive', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { data: unit, error } = await supabase
      .from('units')
      .update({ status: 'Archived', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    invalidateUnitsCache();
    await logAction(req, 'Archive Unit', 'Unit', unit.id, unit.id);
    res.json({ success: true, message: 'Unit archived.', data: { ...unit, _id: unit.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/units/:id/unarchive */
router.patch('/:id/unarchive', authenticateAdmin, requireMainAdmin, async (req, res) => {
  try {
    const { data: unit, error } = await supabase
      .from('units')
      .update({ status: 'Active', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

    invalidateUnitsCache();
    await logAction(req, 'Unarchive Unit', 'Unit', unit.id, unit.id);
    res.json({ success: true, message: 'Unit activated.', data: { ...unit, _id: unit.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.DEFAULT_UNITS = DEFAULT_UNITS;
