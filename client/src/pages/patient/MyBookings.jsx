import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { ChevronRight, FlaskConical, FileText } from 'lucide-react'

const STATUS_COLOR = {
  'Pending':          'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Confirmed':        'bg-blue-100 text-blue-700 border-blue-200',
  'Sample Collected': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Processing':       'bg-purple-100 text-purple-700 border-purple-200',
  'Report Ready':     'bg-green-100 text-green-700 border-green-200',
  'Cancelled':        'bg-red-100 text-red-700 border-red-200',
}

const STATUSES = ['All', 'Pending', 'Confirmed', 'Sample Collected', 'Processing', 'Report Ready', 'Cancelled']

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/patient/tests" className="btn-primary text-sm">+ Book Test</Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === s ? 'bg-lab text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-lab hover:text-lab'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FlaskConical size={48} className="mx-auto mb-3 opacity-30" />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <Link key={b._id} to={`/patient/bookings/${b._id}`}
              className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow block">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-gray-900 text-sm">{b.bookingId}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1 truncate">{b.tests.map(t => t.name).join(' · ')}</div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>📅 {new Date(b.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span>💳 {b.paymentMethod}</span>
                  <span className="font-medium text-gray-600">₹{b.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {b.status === 'Report Ready' && (
                  <Link to={`/patient/report/${b._id}`} onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100">
                    <FileText size={12} /> Report
                  </Link>
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}