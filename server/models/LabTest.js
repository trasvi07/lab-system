const mongoose = require('mongoose');

const testParameterSchema = new mongoose.Schema({
  name: String,
  unit: String,
  normalRange: { min: Number, max: Number },
  description: String
});

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['Haematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Hormones', 'Urine', 'Cardiac', 'Diabetes'],
    required: true
  },
  description: String,
  price: { type: Number, required: true },
  turnaroundTime: String,
  sampleType: { type: String, enum: ['Blood', 'Urine', 'Stool', 'Swab', 'Other'] },
  preparation: String,
  parameters: [testParameterSchema],
  isActive: { type: Boolean, default: true },
  popularity: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);