import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { MapPin, Calendar, CreditCard, CheckCircle, FlaskConical } from 'lucide-react'

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Net Banking']
const TIME_SLOTS = ['07:00 AM - 09:00 AM', '09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM']

export default function BookTest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState({
    street: '', city: '', state: '', pincode: '',
    preferredDate: '', preferredTime: TIME_SLOTS[0],
    paymentMethod: 'UPI', specialInstructions: ''
  })

  useEffect(() => {
    const saved = sessionStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
    else navigate('/patient/tests')
  }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const total = cart.reduce((s, t) => s + t.price, 0)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await api.post('/bookings', {
        tests: cart.map(t => t._id),
        collectionAddress: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        paymentMethod: form.paymentMethod,
        specialInstructions: form.specialInstructions
      })
      sessionStorage.removeItem('cart')
      setSuccess(res.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-500 mb-4">Your booking ID is</p>
      <div className="bg-lab-dark text-white text-xl font-bold rounded-xl py-3 px-6 inline-block mb-6">
        {success.bookingId}
      </div>
      <p className="text-sm text-gray-500 mb-8">Our staff will arrive at your address on your preferred date.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/patient/bookings')} className="btn-primary px-6">View My Bookings</button>
        <button onClick={() => navigate('/patient/tests')} className="btn-secondary px-6">Book More Tests</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Tests</h1>
        <p className="text-gray-500 text-sm mt-1">Complete your booking in 2 simple steps</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-lab text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
            <span className={`text-sm font-medium ${step >= s ? 'text-lab' : 'text-gray-400'}`}>
              {s === 1 ? 'Address & Schedule' : 'Payment & Review'}
            </span>
            {s < 2 && <div className={`h-px w-10 ${step > s ? 'bg-lab' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Cart summary */}
      <div className="card p-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <FlaskConical size={15} /> Selected Tests
        </h3>
        <div className="space-y-2">
          {cart.map(t => (
            <div key={t._id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{t.name}</span>
              <span className="font-medium">₹{t.price}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex items-center justify-between font-bold">
            <span>Total</span>
            <span className="text-lab">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin size={16} className="text-lab" /> Collection Address
          </h2>
          <div>
            <label className="label">Street / House No.</label>
            <input className="input" placeholder="e.g. 42, MG Road, Apt 3B" value={form.street} onChange={e => set('street', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">City</label><input className="input" placeholder="Mumbai" value={form.city} onChange={e => set('city', e.target.value)} required /></div>
            <div><label className="label">State</label><input className="input" placeholder="Maharashtra" value={form.state} onChange={e => set('state', e.target.value)} required /></div>
          </div>
          <div><label className="label">Pincode</label><input className="input" placeholder="400001" value={form.pincode} onChange={e => set('pincode', e.target.value)} required /></div>

          <h2 className="font-semibold text-gray-900 flex items-center gap-2 pt-2">
            <Calendar size={16} className="text-lab" /> Preferred Schedule
          </h2>
          <div>
            <label className="label">Preferred Date</label>
            <input type="date" className="input" value={form.preferredDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('preferredDate', e.target.value)} required />
          </div>
          <div>
            <label className="label">Preferred Time Slot</label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => set('preferredTime', slot)}
                  className={`text-xs py-2 px-3 rounded-lg border text-center transition-colors ${form.preferredTime === slot ? 'border-lab bg-blue-50 text-lab font-medium' : 'border-gray-200 text-gray-600 hover:border-lab'}`}>
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep(2)}
            disabled={!form.street || !form.city || !form.state || !form.pincode || !form.preferredDate}
            className="btn-primary w-full py-2.5">
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard size={16} className="text-lab" /> Payment Method
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'UPI', icon: '📱', label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
              { id: 'Card', icon: '💳', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay' },
              { id: 'Net Banking', icon: '🏦', label: 'Net Banking', desc: 'All major banks' },
              { id: 'Cash', icon: '💵', label: 'Cash on Collection', desc: 'Pay when sample is collected' },
            ].map(m => (
              <button key={m.id} onClick={() => set('paymentMethod', m.id)}
                className={`p-4 rounded-xl border text-left transition-all ${form.paymentMethod === m.id ? 'border-lab bg-blue-50 ring-1 ring-lab' : 'border-gray-200 hover:border-lab hover:bg-gray-50'}`}>
                <div className="text-2xl mb-2">{m.icon}</div>
                <div className={`text-sm font-semibold ${form.paymentMethod === m.id ? 'text-lab' : 'text-gray-800'}`}>{m.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{m.desc}</div>
                {form.paymentMethod === m.id && (
                  <div className="mt-2 text-xs text-lab font-medium flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-lab flex items-center justify-center text-white text-xs">✓</span> Selected
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* UPI input */}
          {form.paymentMethod === 'UPI' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <label className="label text-xs">Enter UPI ID</label>
              <input className="input bg-white" placeholder="yourname@upi" />
              <p className="text-xs text-gray-400">You will receive a payment request after booking is confirmed</p>
            </div>
          )}

          {/* Card input */}
          {form.paymentMethod === 'Card' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <div>
                <label className="label text-xs">Card Number</label>
                <input className="input bg-white" placeholder="1234 5678 9012 3456" maxLength={19}
                  onChange={e => { let v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim(); e.target.value = v }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Expiry</label>
                  <input className="input bg-white" placeholder="MM / YY" maxLength={7} />
                </div>
                <div>
                  <label className="label text-xs">CVV</label>
                  <input className="input bg-white" placeholder="•••" maxLength={3} type="password" />
                </div>
              </div>
              <p className="text-xs text-gray-400">🔒 Your card details are encrypted and secure</p>
            </div>
          )}

          {/* Net Banking */}
          {form.paymentMethod === 'Net Banking' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <label className="label text-xs">Select Your Bank</label>
              <select className="input bg-white">
                <option value="">Choose bank…</option>
                {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank', 'IndusInd Bank'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400">You will be redirected to your bank after booking confirmation</p>
            </div>
          )}

          {/* Cash note */}
          {form.paymentMethod === 'Cash' && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-sm text-amber-800 font-medium">💵 Pay when our staff arrives</p>
              <p className="text-xs text-amber-600 mt-1">Please keep exact change ready at the time of sample collection</p>
            </div>
          )}

          <div>
            <label className="label">Special Instructions (optional)</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Any special instructions for our staff..."
              value={form.specialInstructions} onChange={e => set('specialInstructions', e.target.value)} />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            <div className="font-semibold text-gray-700 mb-2">Booking Summary</div>
            <div className="flex justify-between text-gray-600"><span>Address</span><span className="text-right max-w-48 truncate">{form.street}, {form.city}</span></div>
            <div className="flex justify-between text-gray-600"><span>Date</span><span>{new Date(form.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
            <div className="flex justify-between text-gray-600"><span>Time</span><span>{form.preferredTime}</span></div>
            <div className="flex justify-between text-gray-600"><span>Payment</span><span>{form.paymentMethod}</span></div>
            <div className="flex justify-between font-bold text-lab border-t pt-2 mt-2"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary px-6">← Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-2.5">
              {loading ? 'Placing Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}