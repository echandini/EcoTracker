const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  truckName: { type: String, required: true, trim: true },
  wardName: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('TruckRoute', routeSchema);
