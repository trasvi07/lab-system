import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { Save } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || ''
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    try {
      await api.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode }
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-lab flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-gray-900 text-lg">{user?.name}</div>
          <div className="text-gray-500 text-sm">{user?.email}</div>
          <div className="text-xs text-lab font-medium mt-1 capitalize">{user?.role}</div>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" className="input" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
          </div>
        </div>

        <h2 className="font-semibold text-gray-900 pt-2">Default Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Street</label>
            <input className="input" placeholder="Street address" value={form.street} onChange={e => set('street', e.target.value)} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input className="input" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-6">
          <Save size={15} />{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}