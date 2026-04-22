import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import { CheckCircle, Clock, FileText, MapPin, Calendar, User, ArrowLeft } from 'lucide-react'

const STEPS = ['Pending', 'Confirmed', 'Sample Collected', 'Processing', 'Report Ready']

export default function BookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/bookings/${id}`).then(r => setBooking(r.data)).finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    const { data } = await api.patch(`/bookings/${id}/cancel`)
    setBooking(data)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lab" /></div>
  if (!booking) return <div className="text-center py-20 text-gray-400">Booking not found</div>

  const stepIndex = booking.status === 'Cancelled' ? -1 : STEPS.indexOf(booking.status)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/patient/bookings" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{booking.bookingId}</h1>
          <p className="text-sm text-gray-500">{new Date(booking.createdAt).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Status tracker */}
      {booking.status !== 'Cancelled' ? (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Booking Status</h2>
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {STEPS.map((step, i) => {
                const done = i < stepIndex
                const active = i === stepIndex
                return (
                  <div key={step} className="flex items-start gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${done ? 'bg-green-500 text-white' : active ? 'bg-lab text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-400'}`}>
                      {done ? <CheckCircle size={16} /> : active ? <Clock size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <div className={`pt-1 ${active ? 'text-lab font-semibold' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                      <div className="text-sm">{step}</div>
                      {active && (
                        <div className="text-xs font-normal text-gray-500 mt-0.5">Current status</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-medium text-sm">
          ✗ This booking was cancelled
        </div>
      )}

      {/* Tests */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Tests Booked</h2>
        <div className="space-y-2">
          {booking.tests.map(t => (
            <div key={t._id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{t.name}</span>
              <span className="font-medium text-gray-900">₹{t.price}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-lab">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 mb-2">Collection Details</h2>
        <div className="flex items-start gap-3 text-sm">
          <MapPin size={15} className="text-lab mt-0.5 flex-shrink-0" />
          <span className="text-gray-600">{booking.collectionAddress?.street}, {booking.collectionAddress?.city}, {booking.collectionAddress?.state} - {booking.collectionAddress?.pincode}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar size={15} className="text-lab" />
          <span className="text-gray-600">{new Date(booking.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} · {booking.preferredTime}</span>
        </div>
        {booking.assignedStaff && (
          <div className="flex items-center gap-3 text-sm">
            <User size={15} className="text-lab" />
            <span className="text-gray-600">Staff: {booking.assignedStaff.name}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {booking.status === 'Report Ready' && (
          <Link to={`/patient/report/${booking._id}`} className="btn-primary flex-1 text-center py-2.5 flex items-center justify-center gap-2">
            <FileText size={16} /> View Report
          </Link>
        )}
        {['Pending', 'Confirmed'].includes(booking.status) && (
          <button onClick={handleCancel} className="btn-secondary flex-1 py-2.5 text-red-600 border-red-300 hover:bg-red-50">
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  )
}