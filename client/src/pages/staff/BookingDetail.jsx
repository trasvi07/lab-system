import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { ArrowLeft, MapPin, Calendar, User, FileText } from 'lucide-react'

const NEXT_STATUS = {
  'Pending': 'Confirmed',
  'Confirmed': 'Sample Collected',
  'Sample Collected': 'Processing',
  'Processing': 'Report Ready'
}

export default function StaffBookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    api.get(`/bookings/${id}`)
      .then(r => setBooking(r.data))
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async () => {
    const next = NEXT_STATUS[booking.status]
    if (!next) return
    setUpdating(true)
    try {
      const { data } = await api.patch(`/bookings/${id}/status`, { status: next, note })
      setBooking(data)
      setNote('')
      if (next === 'Processing') navigate(`/staff/bookings/${id}/results`)
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed')
    } finally { setUpdating(false) }
  }

  const STATUS_COLOR = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-blue-100 text-blue-700',
    'Sample Collected': 'bg-indigo-100 text-indigo-700',
    'Processing': 'bg-purple-100 text-purple-700',
    'Report Ready': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700'
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lab" /></div>
  if (!booking) return <div className="text-center py-20">Booking not found</div>

  const nextStatus = NEXT_STATUS[booking.status]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/staff/bookings" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{booking.bookingId}</h1>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[booking.status]}`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* Patient info */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <User size={15} /> Patient Details
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Name</span><div className="font-medium">{booking.patient?.name}</div></div>
          <div><span className="text-gray-400">Phone</span><div className="font-medium">{booking.patient?.phone}</div></div>
          <div><span className="text-gray-400">Email</span><div className="font-medium">{booking.patient?.email}</div></div>
          <div><span className="text-gray-400">Gender</span><div className="font-medium capitalize">{booking.patient?.gender || 'N/A'}</div></div>
        </div>
      </div>

      {/* Tests */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Tests</h2>
        <div className="space-y-2">
          {booking.tests?.map(t => (
            <div key={t._id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
              <div>
                <div className="font-medium text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-400">{t.category} · {t.sampleType}</div>
              </div>
              <span className="font-medium">₹{t.price}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-sm pt-1">
            <span>Total</span>
            <span className="text-lab">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Collection details */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 mb-1">Collection Details</h2>
        <div className="flex items-start gap-2 text-sm">
          <MapPin size={14} className="text-lab mt-0.5" />
          <span className="text-gray-600">{booking.collectionAddress?.street}, {booking.collectionAddress?.city}, {booking.collectionAddress?.state} - {booking.collectionAddress?.pincode}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-lab" />
          <span className="text-gray-600">{new Date(booking.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })} · {booking.preferredTime}</span>
        </div>
        {booking.specialInstructions && (
          <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
            💬 {booking.specialInstructions}
          </div>
        )}
      </div>

      {/* Status history */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Status History</h2>
        <div className="space-y-3">
          {booking.statusHistory?.slice().reverse().map((h, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-lab mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">{h.status}</span>
                {h.note && <span className="text-gray-500 ml-2">— {h.note}</span>}
                <div className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update status */}
      {nextStatus && booking.status !== 'Cancelled' && (
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Update Status → {nextStatus}</h2>
          <div>
            <label className="label">Note (optional)</label>
            <input className="input" placeholder="Add a note for this update…"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={updateStatus} disabled={updating} className="btn-primary flex-1 py-2.5">
              {updating ? 'Updating…' : `Mark as "${nextStatus}"`}
            </button>
            {booking.status === 'Sample Collected' && (
              <Link to={`/staff/bookings/${id}/results`} className="btn-secondary px-5 py-2.5 flex items-center gap-2">
                <FileText size={15} /> Enter Results
              </Link>
            )}
          </div>
        </div>
      )}

      {booking.status === 'Report Ready' && (
        <Link to={`/staff/bookings/${id}/results`} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
          <FileText size={15} /> View / Edit Report
        </Link>
      )}
    </div>
  )
}