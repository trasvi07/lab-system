const express = require('express');
const Booking = require('../models/Booking');
const LabTest = require('../models/LabTest');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const router = express.Router();

// Patient: Create booking
router.post('/', protect, async (req, res) => {
  try {
    const { tests, collectionAddress, preferredDate, preferredTime, paymentMethod, specialInstructions } = req.body;
    const testDocs = await LabTest.find({ _id: { $in: tests } });
    const totalAmount = testDocs.reduce((sum, t) => sum + t.price, 0);
    const booking = await Booking.create({
      patient: req.user._id, tests, collectionAddress,
      preferredDate, preferredTime, paymentMethod, specialInstructions, totalAmount,
      statusHistory: [{ status: 'Pending', updatedBy: req.user._id, note: 'Booking created' }]
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { notifications: { message: `Booking ${booking.bookingId} created successfully!`, type: 'success' } }
    });
    await booking.populate(['tests', 'patient']);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Patient: Get own bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ patient: req.user._id })
      .populate('tests', 'name code price category')
      .populate('assignedStaff', 'name phone')
      .populate('report')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Staff: Get all bookings
router.get('/all', protect, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    const bookings = await Booking.find(filter)
      .populate('patient', 'name email phone')
      .populate('tests', 'name code price')
      .populate('assignedStaff', 'name phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth gender')
      .populate('tests')
      .populate('assignedStaff', 'name phone email')
      .populate('report');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role === 'patient' && booking.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Staff: Update status
router.patch('/:id/status', protect, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { status, note, assignedStaff } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = status;
    booking.statusHistory.push({ status, updatedBy: req.user._id, note });
    if (assignedStaff) booking.assignedStaff = assignedStaff;
    await booking.save();
    const msgs = {
      'Confirmed': `Your booking ${booking.bookingId} is confirmed!`,
      'Sample Collected': `Sample for ${booking.bookingId} has been collected.`,
      'Processing': `Your samples for ${booking.bookingId} are being processed.`,
      'Report Ready': `Your report for ${booking.bookingId} is ready!`
    };
    if (msgs[status]) {
      await User.findByIdAndUpdate(booking.patient, {
        $push: { notifications: { message: msgs[status], type: status === 'Report Ready' ? 'success' : 'info' } }
      });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Patient: Cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, patient: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel at this stage' });
    }
    booking.status = 'Cancelled';
    booking.statusHistory.push({ status: 'Cancelled', updatedBy: req.user._id, note: 'Cancelled by patient' });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;