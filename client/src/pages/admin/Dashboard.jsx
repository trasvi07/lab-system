import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { Users, ClipboardList, FileText, TrendingUp, ChevronRight, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/staff/stats'),
      api.get('/bookings/all'),
      api.get('/admin/users')
    ]).then(([s, b, u]) => {
      setStats({ ...s.data, totalUsers: u.data.length })
      setRecentBookings(b.data.slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  const STATUS_COLOR = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-blue-100 text-blue-700',
    'Sample Collected': 'bg-indigo-100 text-indigo-700',
    'Processing': 'bg-purple-100 text-purple-700',
    'Report Ready': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Full system overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-lab' },
          { label: 'Total Bookings', value: stats?.total ?? '—', icon: ClipboardList, color: 'text-amber-600' },
          { label: 'Reports Generated', value: stats?.reportReady ?? '—', icon: FileText, color: 'text-green-600' },
          { label: "Today's Bookings", value: stats?.todayBookings ?? '—', icon: Activity, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <s.icon size={18} className={s.color} />
            <div className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      {stats?.statusBreakdown && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-lab" /> Bookings by Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.statusBreakdown.map(s => (
              <div key={s._id} className={`rounded-xl px-3 py-3 text-center ${STATUS_COLOR[s._id] || 'bg-gray-50 text-gray-600'}`}>
                <div className="text-2xl font-bold">{s.count}</div>
                <div className="text-xs font-medium mt-0.5 leading-tight">{s._id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/users', icon: Users, label: 'Manage Users', desc: 'View and manage all users', color: 'bg-blue-50 text-lab' },
          { to: '/admin/bookings', icon: ClipboardList, label: 'All Bookings', desc: 'View every booking', color: 'bg-purple-50 text-purple-700' },
          { to: '/admin/reports', icon: FileText, label: 'All Reports', desc: 'View all generated reports', color: 'bg-green-50 text-green-700' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="card p-5 hover:shadow-md transition-shadow flex items-start gap-4">
            <div className={`p-2.5 rounded-xl ${a.color}`}><a.icon size={20} /></div>
            <div>
              <div className="font-semibold text-gray-800">{a.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-lab hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="space-y-2">
            {recentBookings.map(b => (
              <div key={b._id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{b.bookingId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{b.patient?.name} · {b.tests?.map(t => t.name).join(', ')}</div>
                </div>
                <div className="text-xs text-gray-400">₹{b.totalAmount?.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}