const express = require('express');
const Report = require('../models/Report');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const router = express.Router();

// Staff: Create report
router.post('/booking/:bookingId', protect, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const { results, overallSummary, recommendations, doctorNote } = req.body;
    const processedResults = results.map(r => ({
      ...r,
      parameters: r.parameters.map(p => {
        let status = 'Normal';
        if (p.value > p.normalRange.max * 1.5) status = 'Critical High';
        else if (p.value > p.normalRange.max) status = 'High';
        else if (p.value < p.normalRange.min * 0.5) status = 'Critical Low';
        else if (p.value < p.normalRange.min) status = 'Low';
        return { ...p, status };
      }),
      technician: req.user._id
    }));
    let report = await Report.findOne({ booking: booking._id });
    if (report) {
      report.results = processedResults;
      report.overallSummary = overallSummary;
      report.recommendations = recommendations;
      report.doctorNote = doctorNote;
      report.generatedBy = req.user._id;
    } else {
      report = new Report({
        booking: booking._id, patient: booking.patient,
        results: processedResults, overallSummary, recommendations, doctorNote,
        generatedBy: req.user._id
      });
    }
    await report.save();
    booking.report = report._id;
    booking.status = 'Report Ready';
    booking.statusHistory.push({ status: 'Report Ready', updatedBy: req.user._id, note: 'Report generated' });
    await booking.save();
    await User.findByIdAndUpdate(booking.patient, {
      $push: { notifications: { message: `Your report for booking ${booking.bookingId} is ready!`, type: 'success' } }
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get report by booking
router.get('/booking/:bookingId', protect, async (req, res) => {
  try {
    const report = await Report.findOne({ booking: req.params.bookingId })
      .populate('patient', 'name email dateOfBirth gender phone')
      .populate({ path: 'booking', populate: { path: 'tests', select: 'name code category' } })
      .populate('generatedBy', 'name');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get report by id + PDF
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patient', 'name email dateOfBirth gender phone')
      .populate({ path: 'booking', populate: { path: 'tests', select: 'name code category' } })
      .populate('generatedBy', 'name');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PDF view
router.get('/:id/pdf', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patient', 'name email dateOfBirth gender phone')
      .populate({ path: 'booking', populate: { path: 'tests', select: 'name code' } })
      .populate('generatedBy', 'name');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    const statusColor = { Normal: '#16a34a', High: '#dc2626', Low: '#2563eb', 'Critical High': '#7c3aed', 'Critical Low': '#7c3aed' };
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report ${report.reportId}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{color:#0f4c81}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#0f4c81;color:#fff;padding:10px;text-align:left}td{padding:9px;border-bottom:1px solid #eee}.badge{font-weight:700}</style>
    </head><body>
    <h1>🔬 MedIntel Diagnostics</h1>
    <p><strong>Report ID:</strong> ${report.reportId} &nbsp;&nbsp; <strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString('en-IN')}</p>
    <h3>Patient: ${report.patient.name} | ${report.patient.gender || ''} | ${report.patient.phone}</h3>
    ${report.results.map(r => `
      <table><thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Normal Range</th><th>Status</th></tr></thead>
      <tbody>${r.parameters.map(p => `<tr><td>${p.name}</td><td><strong>${p.value}</strong></td><td>${p.unit}</td><td>${p.normalRange.min}–${p.normalRange.max}</td>
      <td><span class="badge" style="color:${statusColor[p.status]||'#333'}">${p.status}</span></td></tr>`).join('')}</tbody></table>
    `).join('')}
    ${report.overallSummary ? `<h3>Summary</h3><p>${report.overallSummary}</p>` : ''}
    ${report.recommendations?.length ? `<h3>Recommendations</h3><ul>${report.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
    <script>window.onload=()=>window.print()</script>
    </body></html>`;
    res.send(html);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;