const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  truck: { type: String, required: true },
  ward: { type: String, required: true },
  supervisor: { type: String, required: true },
  area: { type: String, required: true },
  date: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true }
}, { timestamps: true });

scheduleSchema.index({ truck: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
