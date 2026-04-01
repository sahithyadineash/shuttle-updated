const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  destination: String,
  status: { type: String, default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);