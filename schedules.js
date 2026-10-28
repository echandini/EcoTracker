const router = require('express').Router();
const Schedule = require('../models/Schedule');
const TruckRoute = require('../models/TruckRoute');
const Ward = require('../models/Ward');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { generateSchedules } = require('../utils/scheduler');

router.get('/', authenticate, async (req, res, next) => {
  try { res.json({ success: true, schedules: await Schedule.find().sort({ truck: 1, date: 1, time: 1 }) }); } catch (e) { next(e); }
});

router.post('/generate', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const routes = await TruckRoute.find().lean();
    const wards = await Ward.find().lean();
    if (!routes.length) return res.status(400).json({ success: false, message: 'No routes assigned' });
    const generated = generateSchedules(routes, wards);
    await Schedule.deleteMany({});
    const schedules = await Schedule.insertMany(generated);
    res.status(201).json({ success: true, message: 'Collision-free weekly timetable generated successfully!', schedules });
  } catch (e) { next(e); }
});

module.exports = router;
