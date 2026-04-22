const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['staff', 'admin'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', protect, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, todayBookings, pending, reportReady] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Report Ready' })
    ]);
    const statusBreakdown = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({ total, todayBookings, pending, reportReady, statusBreakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/users', protect, requireRole('admin'), async (req, res) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 })
      res.json(users)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
  
  router.patch('/users/:id/role', protect, requireRole('admin'), async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
      ).select('-password')
      res.json(user)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
  
  router.get('/reports/all', protect, requireRole('admin'), async (req, res) => {
    try {
      const Report = require('../models/Report')
      const reports = await Report.find()
        .populate('patient', 'name email')
        .populate({ path: 'booking', populate: { path: 'tests', select: 'name' } })
        .populate('generatedBy', 'name')
        .sort({ createdAt: -1 })
      res.json(reports)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })
module.exports = router;