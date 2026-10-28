const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  ward: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Complaint', 'Missed Pickup', 'Feedback'], required: true },
  text: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
