const express = require('express');
const Payment = require('../models/payment');

const router = express.Router();

// Get user payments
router.get('/:userId', async (req, res) => {
  const payments = await Payment.find({ user_id: req.params.userId });
  res.json(payments);
});

// Create payment
router.post('/', async (req, res) => {
  const payment = new Payment(req.body);
  await payment.save();
  res.json(payment);
});

module.exports = router;