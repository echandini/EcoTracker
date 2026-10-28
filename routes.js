const router = require('express').Router();
const TruckRoute = require('../models/TruckRoute');
const Ward = require('../models/Ward');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try { res.json({ success: true, routes: await TruckRoute.find().sort({ truckName: 1, wardName: 1 }) }); } catch (e) { next(e); }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { truckName, wardName } = req.body;
    if (!truckName || !wardName) return res.status(400).json({ success: false, message: 'Truck name and ward are required' });
    if (!await Ward.findOne({ wardName })) return res.status(400).json({ success: false, message: 'Ward does not exist' });
    const route = await TruckRoute.create({ truckName, wardName });
    res.status(201).json({ success: true, route });
  } catch (e) { next(e); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { truckName, wardName } = req.body;
    if (!truckName || !wardName) return res.status(400).json({ success: false, message: 'Truck name and ward are required' });
    if (!await Ward.findOne({ wardName })) return res.status(400).json({ success: false, message: 'Ward does not exist' });
    const route = await TruckRoute.findByIdAndUpdate(req.params.id, { truckName, wardName }, { new: true, runValidators: true });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, route });
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const route = await TruckRoute.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, message: 'Route deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
