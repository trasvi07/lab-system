import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { ChevronRight, Search } from 'lucide-react'

const STATUS_COLOR = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Confirmed': 'bg-blue-100 text-blue-700',
  'Sample Collected': 'bg-indigo-100 text-indigo-700',
  'Processing': 'bg-purple-100 text-purple-700',
  'Report Ready': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700'
}

const STATUSES = ['All', 'Pending', 'Confirmed', 'Sample Collected', 'Processing', 'Report Ready', 'Cancelled']

export default function StaffBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/bookings/all', { params: { status } })
      .then(r => setBookings(r.data))
      .finally(() => setLoading(false))
  }, [status])

  const filtered = search
    ? bookings.filter(b =>
        b.bookingId.includes(search.toUpperCase()) ||
        b.patient?.name?.toLowerCase().includes(search.toLowerCase()))
    : bookings

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
        <input className="input pl-8" placeholder="Search by Booking ID or patient name…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${status === s ? 'bg-lab text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-lab'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No bookings found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => (
            <Link key={b._id} to={`/staff/bookings/${b._id}`}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-sm text-gray-900">{b.bookingId}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                </div>
                <div className="text-sm text-gray-600">{b.patient?.name} · {b.patient?.phone}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">{b.tests?.map(t => t.name).join(', ')}</div>
              </div>
              <div className="text-right text-xs text-gray-400 flex-shrink-0">
                <div>{new Date(b.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                <div className="font-semibold text-gray-700 mt-0.5">₹{b.totalAmount?.toLocaleString('en-IN')}</div>
              </div>
              <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}