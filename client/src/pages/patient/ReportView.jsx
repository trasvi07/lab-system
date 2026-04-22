import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import { ArrowLeft, Download, CheckCircle, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const cfg = {
    'Normal':        { cls: 'badge-normal', label: '✓ Normal' },
    'High':          { cls: 'badge-high', label: '↑ High' },
    'Low':           { cls: 'badge-low', label: '↓ Low' },
    'Critical High': { cls: 'badge-critical', label: '⚠ Critical High' },
    'Critical Low':  { cls: 'badge-critical', label: '⚠ Critical Low' },
  }[status] || { cls: 'badge-normal', label: status }

  return <span className={cfg.cls}>{cfg.label}</span>
}

export default function ReportView() {
  const { bookingId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/reports/booking/${bookingId}`)
      .then(r => setReport(r.data))
      .finally(() => setLoading(false))
  }, [bookingId])

  const downloadPDF = () => {
    window.open(`/api/reports/${report._id}/pdf`, '_blank')
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lab" /></div>
  if (!report) return <div className="text-center py-20 text-gray-400">Report not available yet</div>

  const hasAbnormal = report.results?.some(r =>
    r.parameters?.some(p => p.status !== 'Normal')
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={`/patient/bookings/${bookingId}`} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Lab Report — {report.reportId}</h1>
          <p className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={downloadPDF} className="btn-primary flex items-center gap-2 text-sm">
          <Download size={15} /> Download PDF
        </button>
      </div>

      {/* Alert if abnormal */}
      {hasAbnormal && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-800 text-sm">Some values are outside normal range</div>
            <div className="text-amber-700 text-xs mt-0.5">Please consult your doctor to understand these results.</div>
          </div>
        </div>
      )}

      {/* Patient info */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">Patient Information</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Name</span><div className="font-medium text-gray-900 mt-0.5">{report.patient?.name}</div></div>
          <div><span className="text-gray-400">Gender</span><div className="font-medium text-gray-900 mt-0.5 capitalize">{report.patient?.gender || 'N/A'}</div></div>
          <div><span className="text-gray-400">Phone</span><div className="font-medium text-gray-900 mt-0.5">{report.patient?.phone}</div></div>
          <div><span className="text-gray-400">Report ID</span><div className="font-medium text-gray-900 mt-0.5">{report.reportId}</div></div>
        </div>
      </div>

      {/* Results */}
      {report.results?.map((result, ri) => (
        <div key={ri} className="card overflow-hidden">
          <div className="bg-lab-dark text-white px-5 py-3">
            <h2 className="font-semibold text-sm">Test Results</h2>
          </div>
          <div className="p-5 space-y-4">
            {result.parameters?.map((param, pi) => (
              <div key={pi} className={`rounded-xl p-4 border ${
                param.status === 'Normal' ? 'bg-green-50 border-green-100' :
                param.status?.includes('Critical') ? 'bg-purple-50 border-purple-100' :
                param.status === 'High' ? 'bg-red-50 border-red-100' :
                'bg-blue-50 border-blue-100'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{param.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Normal: {param.normalRange?.min} – {param.normalRange?.max} {param.unit}</div>
                  </div>
                  <StatusBadge status={param.status} />
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{param.value}</span>
                  <span className="text-sm text-gray-500">{param.unit}</span>
                </div>
                {/* Visual bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${
                    param.status === 'Normal' ? 'bg-green-500' :
                    param.status?.includes('Critical') ? 'bg-purple-500' :
                    param.status === 'High' ? 'bg-red-400' : 'bg-blue-400'
                  }`} style={{ width: `${Math.min(100, Math.max(5, (param.value / (param.normalRange?.max * 1.5)) * 100))}%` }} />
                </div>
                {param.explanation && (
                  <p className="text-xs text-gray-600 mt-1">{param.explanation}</p>
                )}
              </div>
            ))}
            {result.interpretation && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Interpretation</div>
                <p className="text-sm text-gray-700">{result.interpretation}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Summary */}
      {report.overallSummary && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Overall Summary</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{report.overallSummary}</p>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">💡 Recommendations</h2>
          <ul className="space-y-2">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.doctorNote && (
        <div className="card p-5 border-l-4 border-l-amber-400">
          <h2 className="font-semibold text-amber-800 mb-2">🩺 Doctor's Note</h2>
          <p className="text-sm text-gray-600">{report.doctorNote}</p>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 pb-4">
        Report generated by {report.generatedBy?.name || 'Lab Staff'} · MedIntel Diagnostics
      </div>
    </div>
  )
}