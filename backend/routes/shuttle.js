const express = require('express');
const Shuttle = require('../models/Shuttle');  // ✅ Fixed - was missing 'Shuttle'
const Route = require('../models/Route');      // ✅ Fixed - was 'Routes', should be 'Route'

const router = express.Router();

// Get all shuttles
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

// Get shuttle by ID
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

// Create shuttle (Admin only - we'll add auth later)
router.post('/', async (req, res) => {
  try {
    const shuttle = new Shuttle(req.body);
    await shuttle.save();
    res.status(201).json(shuttle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update shuttle location (Driver)
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

// Update seat availability
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