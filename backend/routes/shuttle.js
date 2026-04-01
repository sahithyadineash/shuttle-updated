const express = require('express');
const Shuttle = require('../models/Shuttle');
const Route = require('../models/Route');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

/** Shuttles assigned to the logged-in driver (must be before /:id). */
router.get('/mine', requireRole('driver'), async (req, res) => {
  try {
    const shuttles = await Shuttle.find({ driver_id: req.userId })
      .populate('route_id')
      .populate('driver_id', 'name phone');
    res.json(shuttles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const shuttles = await Shuttle.find()
      .populate('route_id')
      .populate('driver_id', 'name phone');
    res.json(shuttles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const shuttle = await Shuttle.findById(req.params.id)
      .populate('route_id')
      .populate('driver_id', 'name phone');

    if (!shuttle) {
      return res.status(404).json({ message: 'Shuttle not found' });
    }

    res.json(shuttle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const shuttle = new Shuttle(req.body);
    await shuttle.save();
    res.status(201).json(shuttle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const shuttle = await Shuttle.findByIdAndUpdate(
      req.params.id,
      { current_location: { lat, lng } },
      { new: true }
    );

    if (!shuttle) {
      return res.status(404).json({ message: 'Shuttle not found' });
    }

    res.json(shuttle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** Driver-only: set shuttle to "available" or "full" (no seat counting). */
router.patch('/:id/availability', requireRole('driver'), async (req, res) => {
  try {
    const { seat_status } = req.body;
    if (!['available', 'full'].includes(seat_status)) {
      return res.status(400).json({ message: 'seat_status must be "available" or "full"' });
    }

    const shuttle = await Shuttle.findById(req.params.id);
    if (!shuttle) {
      return res.status(404).json({ message: 'Shuttle not found' });
    }
    if (!shuttle.driver_id || String(shuttle.driver_id) !== String(req.userId)) {
      return res.status(403).json({ message: 'You can only update your assigned shuttle' });
    }

    shuttle.seat_status = seat_status;
    await shuttle.save();

    const populated = await Shuttle.findById(shuttle._id)
      .populate('route_id')
      .populate('driver_id', 'name phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/seats', async (req, res) => {
  try {
    const { seats_available } = req.body;

    const shuttle = await Shuttle.findByIdAndUpdate(
      req.params.id,
      { seats_available },
      { new: true }
    );

    if (!shuttle) {
      return res.status(404).json({ message: 'Shuttle not found' });
    }

    res.json(shuttle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
