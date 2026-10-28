const router = require('express').Router();
const Complaint = require('../models/Complaint');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (e) { next(e); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { ward, type, text } = req.body;
    if (!ward || !type || !text?.trim()) return res.status(400).json({ success: false, message: 'Ward, type and message are required' });
    if (!['Complaint', 'Missed Pickup', 'Feedback'].includes(type)) return res.status(400).json({ success: false, message: 'Invalid complaint type' });
    const complaint = await Complaint.create({ user: req.user.id, ward, type, text: text.trim(), status: type === 'Feedback' ? 'Resolved' : 'Pending', resolvedAt: type === 'Feedback' ? new Date() : undefined });
    res.status(201).json({ success: true, complaint });
  } catch (e) { next(e); }
});

router.patch('/:id/resolve', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: 'Resolved', resolvedAt: new Date() }, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, complaint });
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
