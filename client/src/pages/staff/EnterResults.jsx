import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'
import { ArrowLeft, Save, Plus, Minus } from 'lucide-react'

export default function EnterResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    results: [],
    overallSummary: '',
    recommendations: [''],
    doctorNote: ''
  })

  useEffect(() => {
    api.get(`/bookings/${id}`).then(r => {
      setBooking(r.data)
      setForm(prev => ({
        ...prev,
        results: r.data.tests.map(test => ({
          test: test._id,
          testName: test.name,
          parameters: test.parameters.map(p => ({
            name: p.name,
            value: '',
            unit: p.unit,
            normalRange: p.normalRange,
            explanation: p.description || ''
          })),
          interpretation: ''
        }))
      }))
    }).finally(() => setLoading(false))
  }, [id])

  const setParamValue = (rIdx, pIdx, val) => {
    setForm(prev => {
      const results = [...prev.results]
      results[rIdx] = {
        ...results[rIdx],
        parameters: results[rIdx].parameters.map((p, i) =>
          i === pIdx ? { ...p, value: val } : p
        )
      }
      return { ...prev, results }
    })
  }

  const setParamExplanation = (rIdx, pIdx, val) => {
    setForm(prev => {
      const results = [...prev.results]
      results[rIdx] = {
        ...results[rIdx],
        parameters: results[rIdx].parameters.map((p, i) =>
          i === pIdx ? { ...p, explanation: val } : p
        )
      }
      return { ...prev, results }
    })
  }

  const setInterpretation = (rIdx, val) => {
    setForm(prev => {
      const results = [...prev.results]
      results[rIdx] = { ...results[rIdx], interpretation: val }
      return { ...prev, results }
    })
  }

  const setRec = (i, val) => setForm(prev => {
    const r = [...prev.recommendations]
    r[i] = val
    return { ...prev, recommendations: r }
  })

  const addRec = () => setForm(prev => ({ ...prev, recommendations: [...prev.recommendations, ''] }))
  const removeRec = (i) => setForm(prev => ({ ...prev, recommendations: prev.recommendations.filter((_, j) => j !== i) }))

  const getStatus = (value, min, max) => {
    const v = parseFloat(value)
    if (isNaN(v)) return null
    if (v > max * 1.5) return 'Critical High'
    if (v > max) return 'High'
    if (v < min * 0.5) return 'Critical Low'
    if (v < min) return 'Low'
    return 'Normal'
  }

  const STATUS_COLOR = {
    'Normal': 'text-green-600 bg-green-50',
    'High': 'text-red-600 bg-red-50',
    'Low': 'text-blue-600 bg-blue-50',
    'Critical High': 'text-purple-600 bg-purple-50',
    'Critical Low': 'text-purple-600 bg-purple-50'
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post(`/reports/booking/${id}`, {
        ...form,
        recommendations: form.recommendations.filter(r => r.trim())
      })
      navigate(`/staff/bookings/${id}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save report')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lab" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/staff/bookings/${id}`} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Enter Test Results</h1>
          <p className="text-sm text-gray-500">{booking?.bookingId} · {booking?.patient?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {form.results.map((result, rIdx) => (
          <div key={rIdx} className="card overflow-hidden">
            <div className="bg-lab-dark px-5 py-3 text-white font-semibold text-sm">
              {result.testName}
            </div>
            <div className="p-5 space-y-4">
              {result.parameters.map((param, pIdx) => {
                const status = getStatus(param.value, param.normalRange.min, param.normalRange.max)
                return (
                  <div key={pIdx} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{param.name}</div>
                        <div className="text-xs text-gray-400">Normal: {param.normalRange.min} – {param.normalRange.max} {param.unit}</div>
                      </div>
                      {status && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[status]}`}>
                          {status}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="label text-xs">Result Value</label>
                        <input type="number" step="any" className="input"
                          placeholder="Enter value" value={param.value}
                          onChange={e => setParamValue(rIdx, pIdx, e.target.value)} required />
                      </div>
                      <div className="w-24">
                        <label className="label text-xs">Unit</label>
                        <input className="input bg-gray-50" value={param.unit} readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="label text-xs">Explanation for patient</label>
                      <input className="input text-sm"
                        placeholder="Simple explanation of this parameter…"
                        value={param.explanation}
                        onChange={e => setParamExplanation(rIdx, pIdx, e.target.value)} />
                    </div>
                  </div>
                )
              })}
              <div>
                <label className="label">Interpretation</label>
                <textarea className="input resize-none" rows={2}
                  placeholder="Technical interpretation for this test…"
                  value={result.interpretation}
                  onChange={e => setInterpretation(rIdx, e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        {/* Summary section */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Report Summary</h2>
          <div>
            <label className="label">Overall Summary</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Overall summary of all test results…"
              value={form.overallSummary}
              onChange={e => setForm(p => ({ ...p, overallSummary: e.target.value }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Recommendations</label>
              <button type="button" onClick={addRec} className="text-xs text-lab flex items-center gap-1 hover:underline">
                <Plus size={12} /> Add
              </button>
            </div>
            {form.recommendations.map((r, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className="input" placeholder={`Recommendation ${i + 1}…`}
                  value={r} onChange={e => setRec(i, e.target.value)} />
                {form.recommendations.length > 1 && (
                  <button type="button" onClick={() => removeRec(i)} className="p-2 text-gray-400 hover:text-red-500">
                    <Minus size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
          <Save size={17} />{saving ? 'Saving Report…' : 'Save & Finalize Report'}
        </button>
      </form>
    </div>
  )
}