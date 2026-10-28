const router = require('express').Router();
const Ward = require('../models/Ward');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try { res.json({ success: true, wards: await Ward.find().sort({ wardName: 1 }) }); } catch (e) { next(e); }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { wardName, areaName, supervisor } = req.body;
    if (!wardName || !areaName || !supervisor) return res.status(400).json({ success: false, message: 'All ward fields are required' });
    const ward = await Ward.create({ wardName, areaName, supervisor });
    res.status(201).json({ success: true, ward });
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const ward = await Ward.findByIdAndDelete(req.params.id);
    if (!ward) return res.status(404).json({ success: false, message: 'Ward not found' });
    await require('../models/TruckRoute').deleteMany({ wardName: ward.wardName });
    await require('../models/Schedule').deleteMany({ ward: ward.wardName });
    res.json({ success: true, message: 'Ward deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
