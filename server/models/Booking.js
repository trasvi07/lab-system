const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' }],
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Sample Collected', 'Processing', 'Report Ready', 'Cancelled'],
    default: 'Pending'
  },
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  collectionAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card', 'Net Banking'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
  totalAmount: { type: Number, required: true },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  specialInstructions: String,
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' }
}, { timestamps: true });

bookingSchema.pre('save', async function() {
    if (!this.bookingId) {
      const count = await mongoose.model('Booking').countDocuments();
      this.bookingId = `LAB${String(count + 1001).padStart(6, '0')}`;
    }
  });

module.exports = mongoose.model('Booking', bookingSchema);