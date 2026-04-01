const mongoose = require('mongoose');

const shuttleSchema = new mongoose.Schema({
  shuttle_number: { type: String, required: true, unique: true },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  current_location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  seats_total: { type: Number, required: true, default: 40 },
  seats_available: { type: Number, required: true, default: 40 },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }
}, { timestamps: true });

module.exports = mongoose.model('Shuttle', shuttleSchema);