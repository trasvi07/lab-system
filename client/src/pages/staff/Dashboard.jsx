import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { ClipboardList, Clock, CheckCircle, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react'

export default function StaffDashboard() {
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/staff/stats'),
      api.get('/bookings/all', { params: { status: 'Pending' } })
    ]).then(([s, b]) => {
      setStats(s.data)
      setBookings(b.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const STATUS_COLOR = {
    'Pending': 'text-yellow-600 bg-yellow-50',
    'Confirmed': 'text-blue-600 bg-blue-50',
    'Sample Collected': 'text-indigo-600 bg-indigo-50',
    'Processing': 'text-purple-600 bg-purple-50',
    'Report Ready': 'text-green-600 bg-green-50',
    'Cancelled': 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lab Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of lab activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: stats?.todayBookings ?? '—', icon: ClipboardList, color: 'text-lab' },
          { label: 'Pending Review', value: stats?.pending ?? '—', icon: Clock, color: 'text-amber-600' },
          { label: 'Reports Ready', value: stats?.reportReady ?? '—', icon: CheckCircle, color: 'text-green-600' },
          { label: 'Total Bookings', value: stats?.total ?? '—', icon: TrendingUp, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <s.icon size={18} className={s.color} />
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      {stats?.statusBreakdown && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Bookings by Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.statusBreakdown.map(s => (
              <div key={s._id} className={`rounded-xl px-4 py-3 ${STATUS_COLOR[s._id] || 'bg-gray-50 text-gray-600'}`}>
                <div className="text-xl font-bold">{s.count}</div>
                <div className="text-xs font-medium mt-0.5">{s._id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending bookings */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" /> Pending Bookings
          </h2>
          <Link to="/staff/bookings" className="text-sm text-lab hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No pending bookings</div>
        ) : (
          <div className="space-y-2">
            {bookings.map(b => (
              <Link key={b._id} to={`/staff/bookings/${b._id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{b.bookingId}</div>
                  <div className="text-xs text-gray-500 truncate">{b.patient?.name} · {b.tests?.map(t => t.name).join(', ')}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(b.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                <ChevronRight size={15} className="text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}