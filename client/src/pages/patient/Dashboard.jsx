import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { FlaskConical, ClipboardList, FileText, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const STATUS_CONFIG = {
  'Pending':          { color: 'bg-yellow-100 text-yellow-700' },
  'Confirmed':        { color: 'bg-blue-100 text-blue-700' },
  'Sample Collected': { color: 'bg-indigo-100 text-indigo-700' },
  'Processing':       { color: 'bg-purple-100 text-purple-700' },
  'Report Ready':     { color: 'bg-green-100 text-green-700' },
  'Cancelled':        { color: 'bg-red-100 text-red-700' },
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [])

  const recent = bookings.slice(0, 5)
  const active = bookings.filter(b => !['Report Ready', 'Cancelled'].includes(b.status))
  const ready = bookings.filter(b => b.status === 'Report Ready')

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-lab-dark to-lab text-white rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-blue-200 mt-1">Welcome to your health dashboard</p>
        <Link to="/patient/tests" className="inline-flex items-center gap-2 mt-4 bg-white text-lab px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
          <FlaskConical size={16} /> Book a Test
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'text-lab' },
          { label: 'Active Tests', value: active.length, color: 'text-amber-600' },
          { label: 'Reports Ready', value: ready.length, color: 'text-green-600' },
          { label: 'Cancelled', value: bookings.filter(b => b.status === 'Cancelled').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/patient/tests', icon: FlaskConical, label: 'Browse Tests', desc: 'Explore our full test catalog', color: 'bg-blue-50 text-lab' },
          { to: '/patient/bookings', icon: ClipboardList, label: 'My Bookings', desc: 'Track your test status', color: 'bg-purple-50 text-purple-700' },
          { to: '/patient/bookings', icon: FileText, label: 'Download Report', desc: 'Get your lab reports', color: 'bg-green-50 text-green-700' },
        ].map(a => (
          <Link key={a.label} to={a.to} className="card p-5 hover:shadow-md transition-shadow flex items-start gap-4">
            <div className={`p-2.5 rounded-xl ${a.color}`}><a.icon size={20} /></div>
            <div>
              <div className="font-semibold text-gray-800">{a.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/patient/bookings" className="text-sm text-lab hover:underline flex items-center gap-1">View all <ChevronRight size={14} /></Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
            <p>No bookings yet</p>
            <Link to="/patient/tests" className="text-lab text-sm hover:underline">Book your first test →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(b => {
              const cfg = STATUS_CONFIG[b.status] || {}
              return (
                <Link key={b._id} to={`/patient/bookings/${b._id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{b.bookingId}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{b.tests.map(t => t.name).join(', ')}</div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{b.status}</span>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}