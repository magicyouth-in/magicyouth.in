/**
 * routes/audit-logs.js
 * Read-only audit log viewer. Main Admin only.
 */

const express           = require('express');
const router            = express.Router();
const AdminActivityLog  = require('../database/models/AdminActivityLog');
const { authenticateAdmin, requireMainAdmin } = require('../middleware/auth');

router.use(authenticateAdmin, requireMainAdmin);

/** GET /api/audit-logs?unitId=&action=&page= */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.unitId)  filter.unitId  = req.query.unitId;
    if (req.query.adminId) filter.adminId = req.query.adminId;
    if (req.query.action)  filter.action  = { $regex: new RegExp(req.query.action, 'i') };

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AdminActivityLog.find(filter)
        .populate('adminId', 'name email role')
        .populate('unitId', 'name code')
        .sort({ timestamp: -1 })
        .skip(skip).limit(limit),
      AdminActivityLog.countDocuments(filter),
    ]);

    res.json({ success: true, data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
