const express = require('express');
const LabTest = require('../models/LabTest');
const { protect, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all tests
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const tests = await LabTest.find(filter).sort({ popularity: -1, name: 1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single test
router.get('/:id', async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed tests
router.post('/seed', protect, requireRole('admin'), async (req, res) => {
  try {
    await LabTest.deleteMany({});
    const tests = [
      {
        name: 'Complete Blood Count (CBC)', code: 'CBC001', category: 'Haematology',
        description: 'Measures different components of blood including red cells, white cells and platelets',
        price: 350, turnaroundTime: '4-6 hours', sampleType: 'Blood',
        preparation: 'No special preparation required', popularity: 95,
        parameters: [
          { name: 'Haemoglobin', unit: 'g/dL', normalRange: { min: 12, max: 17 }, description: 'Protein in red blood cells that carries oxygen' },
          { name: 'WBC Count', unit: 'thousand/µL', normalRange: { min: 4, max: 11 }, description: 'White blood cells — your immune system' },
          { name: 'Platelet Count', unit: 'thousand/µL', normalRange: { min: 150, max: 400 }, description: 'Cells that help blood clot' }
        ]
      },
      {
        name: 'Blood Glucose Fasting', code: 'GLU001', category: 'Diabetes',
        description: 'Measures blood sugar levels after fasting to diagnose or monitor diabetes',
        price: 120, turnaroundTime: '2-3 hours', sampleType: 'Blood',
        preparation: 'Fast for 8-12 hours. Water is allowed.', popularity: 90,
        parameters: [
          { name: 'Fasting Glucose', unit: 'mg/dL', normalRange: { min: 70, max: 100 }, description: 'Blood sugar level after fasting' }
        ]
      },
      {
        name: 'Lipid Profile', code: 'LIP001', category: 'Biochemistry',
        description: 'Measures cholesterol and triglycerides to assess heart disease risk',
        price: 550, turnaroundTime: '4-6 hours', sampleType: 'Blood',
        preparation: 'Fast for 9-12 hours before the test', popularity: 88,
        parameters: [
          { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: { min: 0, max: 200 }, description: 'Total cholesterol in blood' },
          { name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: { min: 40, max: 60 }, description: 'Good cholesterol' },
          { name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: { min: 0, max: 100 }, description: 'Bad cholesterol' },
          { name: 'Triglycerides', unit: 'mg/dL', normalRange: { min: 0, max: 150 }, description: 'Type of fat in blood' }
        ]
      },
      {
        name: 'Thyroid Profile', code: 'THY001', category: 'Hormones',
        description: 'Checks thyroid gland function and hormone levels',
        price: 800, turnaroundTime: '6-8 hours', sampleType: 'Blood',
        preparation: 'Morning sample preferred', popularity: 82,
        parameters: [
          { name: 'TSH', unit: 'mIU/L', normalRange: { min: 0.4, max: 4.0 }, description: 'Controls thyroid activity' },
          { name: 'T3', unit: 'ng/dL', normalRange: { min: 80, max: 200 }, description: 'Active thyroid hormone' },
          { name: 'T4', unit: 'µg/dL', normalRange: { min: 5, max: 12 }, description: 'Main thyroid hormone' }
        ]
      },
      {
        name: 'Liver Function Test', code: 'LFT001', category: 'Biochemistry',
        description: 'Checks how well your liver is working',
        price: 700, turnaroundTime: '6-8 hours', sampleType: 'Blood',
        preparation: 'Avoid alcohol for 24 hours', popularity: 80,
        parameters: [
          { name: 'ALT (SGPT)', unit: 'U/L', normalRange: { min: 7, max: 56 }, description: 'Liver enzyme' },
          { name: 'AST (SGOT)', unit: 'U/L', normalRange: { min: 10, max: 40 }, description: 'Liver and heart enzyme' },
          { name: 'Total Bilirubin', unit: 'mg/dL', normalRange: { min: 0.2, max: 1.2 }, description: 'Breakdown of red blood cells' }
        ]
      },
      {
        name: 'Vitamin D', code: 'VIT001', category: 'Biochemistry',
        description: 'Measures vitamin D levels for bone health and immunity',
        price: 1200, turnaroundTime: '12-24 hours', sampleType: 'Blood',
        preparation: 'No special preparation', popularity: 77,
        parameters: [
          { name: 'Vitamin D (25-OH)', unit: 'ng/mL', normalRange: { min: 30, max: 100 }, description: 'Vitamin D level in blood' }
        ]
      }
    ];
    await LabTest.insertMany(tests);
    res.json({ message: `${tests.length} tests seeded successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;