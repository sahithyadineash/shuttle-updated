const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shuttle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shuttle' },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  destination: { type: String, required: true },
  amount: { type: Number, required: true, default: 20 },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
