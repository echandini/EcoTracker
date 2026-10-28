const router = require('express').Router();
const Ward = require('../models/Ward');
const Complaint = require('../models/Complaint');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [totalWards, totalComplaints, totalPending, totalResolved] = await Promise.all([
      Ward.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'Resolved' })
    ]);

    const wards = await Ward.find().lean();
    const complaints = await Complaint.find().lean();
    const performance = wards.map(ward => {
      const wardComplaints = complaints.filter(c => c.ward === ward.wardName);
      const pending = wardComplaints.filter(c => c.status === 'Pending').length;
      const resolved = wardComplaints.filter(c => c.status === 'Resolved').length;
      const score = Math.max(0, 100 - pending * 5);
      const status = score >= 85 ? 'Excellent' : score >= 60 ? 'Good' : 'Poor';
      return { ...ward, totalComplaints: wardComplaints.length, pending, resolved, score, status };
    });

    res.json({ success: true, stats: { totalWards, totalComplaints, totalPending, totalResolved }, performance });
  } catch (e) { next(e); }
});

router.get('/resident/:ward', authenticate, async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ ward: req.params.ward, user: req.user.id }).lean();
    const open = complaints.filter(c => c.status === 'Pending').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    res.json({ success: true, open, resolved, score: Math.max(0, 100 - open * 5) });
  } catch (e) { next(e); }
});

module.exports = router;
