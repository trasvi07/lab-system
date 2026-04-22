const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' },
  parameters: [{
    name: String,
    value: Number,
    unit: String,
    normalRange: { min: Number, max: Number },
    status: { type: String, enum: ['Normal', 'High', 'Low', 'Critical High', 'Critical Low'] },
    explanation: String
  }],
  interpretation: String,
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const reportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  results: [resultSchema],
  overallSummary: String,
  recommendations: [String],
  doctorNote: String,
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isFinalized: { type: Boolean, default: false },
  pdfPath: String
}, { timestamps: true });

reportSchema.pre('save', async function() {
    if (!this.reportId) {
      const count = await mongoose.model('Report').countDocuments();
      this.reportId = `RPT${String(count + 1001).padStart(6, '0')}`;
    }
  });

module.exports = mongoose.model('Report', reportSchema);