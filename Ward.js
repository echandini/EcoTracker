const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  wardName: { type: String, required: true, unique: true, trim: true },
  areaName: { type: String, required: true, trim: true },
  supervisor: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Ward', wardSchema);
