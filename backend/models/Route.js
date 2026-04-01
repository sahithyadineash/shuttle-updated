const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  route_name: { type: String, required: true },
  stops: [{
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    order: { type: Number, required: true }
  }],
  schedule: {
    start_time: String,
    end_time: String,
    frequency_minutes: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);