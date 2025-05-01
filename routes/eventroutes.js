// // backend/routes/eventRoutes.js
// const express = require('express');
// const router = express.Router();
// const Event = require('../models/Event');

// // Dummy middleware for testing — REMOVE when real auth is added
// const verifyToken = (req, res, next) => next();
// const verifyAdmin = (req, res, next) => next();


// // @route   POST /api/events
// // @desc    Create a new event (admin only)
// router.post('/', verifyToken, verifyAdmin, async (req, res) => {
//   try {
//     const newEvent = new Event(req.body);
//     await newEvent.save();
//     res.status(201).json({ message: 'Event created successfully', event: newEvent });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to create event', error });
//   }
// });

// // @route   GET /api/events
// // @desc    Get all events
// router.get('/', async (req, res) => {
//   try {
//     const events = await Event.find().sort({ date: 1 });
//     res.status(200).json(events);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch events', error });
//   }
// });

// module.exports = router;

// backend/routes/eventRoutes.js


// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Dummy middleware for testing — REMOVE when real auth is added
const verifyToken = (req, res, next) => next();
const verifyAdmin = (req, res, next) => next();

// @route   POST /api/events
// @desc    Create a new event (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error });
  }
});

// @route   GET /api/events
// @desc    Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event by ID
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('Attempting to delete event with ID:', req.params.id);
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      console.warn('No event found with that ID.');
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log('✅ Event deleted:', deleted);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
});

module.exports = router;
