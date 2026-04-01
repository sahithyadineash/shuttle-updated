const express = require('express');
const Payment = require('../models/payment');
const Shuttle = require('../models/Shuttle');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function shuttleAcceptsPassengers(shuttle) {
  if (!shuttle) return false;
  if (shuttle.seat_status === 'full') return false;
  if (shuttle.seat_status === 'available') return true;
  return (shuttle.seats_available ?? 0) >= 1;
}

router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const payments = await Payment.find({ user_id: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('shuttle_id', 'shuttle_number')
      .populate('route_id', 'route_name')
      .lean();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** Paid booking counts by destination (last 7 days) — driver "traffic" hints. */
router.get('/destination-stats', requireRole('driver'), async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const raw = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: since } } },
      { $group: { _id: '$destination', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const stats = raw.map((s) => ({
      destination: s._id || 'Unknown',
      count: s.count,
    }));
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** Recent paid rides on this driver's shuttles. */
router.get('/driver/shuttle-feed', requireRole('driver'), async (req, res) => {
  try {
    const myShuttles = await Shuttle.find({ driver_id: req.userId }).select('_id');
    const ids = myShuttles.map((s) => s._id);
    const payments = await Payment.find({
      shuttle_id: { $in: ids },
      status: 'paid',
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('user_id', 'name email')
      .populate('shuttle_id', 'shuttle_number')
      .lean();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/request', requireAuth, async (req, res) => {
  try {
    const { shuttle_id, route_id, destination } = req.body;
    if (!shuttle_id || !destination) {
      return res.status(400).json({ message: 'shuttle_id and destination are required' });
    }

    const shuttle = await Shuttle.findById(shuttle_id);
    if (!shuttle) {
      return res.status(404).json({ message: 'Shuttle not found' });
    }
    if (shuttle.status !== 'active') {
      return res.status(400).json({ message: 'Shuttle is not active' });
    }
    if (!shuttleAcceptsPassengers(shuttle)) {
      return res.status(400).json({ message: 'Shuttle is full' });
    }

    const payment = new Payment({
      user_id: req.userId,
      shuttle_id,
      route_id: route_id || shuttle.route_id,
      destination: String(destination).trim(),
      amount: 20,
      status: 'pending',
    });
    await payment.save();

    const populated = await Payment.findById(payment._id)
      .populate('shuttle_id', 'shuttle_number')
      .populate('route_id', 'route_name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:paymentId/confirm', requireAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (String(payment.user_id) !== String(req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment is not pending' });
    }

    const shuttle = await Shuttle.findById(payment.shuttle_id);
    if (!shuttleAcceptsPassengers(shuttle)) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ message: 'Shuttle is full' });
    }

    payment.status = 'paid';
    await payment.save();

    const populated = await Payment.findById(payment._id)
      .populate('shuttle_id', 'shuttle_number')
      .populate('route_id', 'route_name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/book', requireAuth, async (req, res) => {
  try {
    const { shuttle_id, destination, route_id } = req.body;
    if (!shuttle_id || !destination) {
      return res.status(400).json({ message: 'shuttle_id and destination are required' });
    }

    const shuttle = await Shuttle.findById(shuttle_id);
    if (!shuttle) {
      return res.status(404).json({ message: 'Shuttle not found' });
    }
    if (shuttle.status !== 'active') {
      return res.status(400).json({ message: 'Shuttle is not active' });
    }
    if (!shuttleAcceptsPassengers(shuttle)) {
      return res.status(400).json({ message: 'Shuttle is full' });
    }

    const payment = new Payment({
      user_id: req.userId,
      shuttle_id,
      route_id: route_id || shuttle.route_id,
      destination: String(destination).trim(),
      amount: 20,
      status: 'paid',
    });
    await payment.save();

    const populated = await Payment.findById(payment._id)
      .populate('shuttle_id', 'shuttle_number')
      .populate('route_id', 'route_name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const payment = new Payment({
      ...req.body,
      user_id: req.body.user_id || req.userId,
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
