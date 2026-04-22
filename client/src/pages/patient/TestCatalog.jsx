import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { Search, FlaskConical, Plus, Minus, ShoppingCart, Clock, Droplets } from 'lucide-react'

const CATEGORIES = ['All', 'Haematology', 'Biochemistry', 'Diabetes', 'Hormones', 'Immunology', 'Cardiac', 'Microbiology', 'Urine']

const CATEGORY_COLORS = {
  Haematology: 'bg-red-50 text-red-700',
  Biochemistry: 'bg-amber-50 text-amber-700',
  Diabetes: 'bg-orange-50 text-orange-700',
  Hormones: 'bg-pink-50 text-pink-700',
  Immunology: 'bg-purple-50 text-purple-700',
  Cardiac: 'bg-rose-50 text-rose-700',
  Microbiology: 'bg-green-50 text-green-700',
  Urine: 'bg-blue-50 text-blue-700'
}

export default function TestCatalog() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.get('/tests', { params: { category, search } })
      .then(r => setTests(r.data))
      .finally(() => setLoading(false))
  }, [category, search])

  const toggle = (test) => setCart(prev =>
    prev.find(t => t._id === test._id)
      ? prev.filter(t => t._id !== test._id)
      : [...prev, test]
  )

  const inCart = id => cart.some(t => t._id === id)
  const total = cart.reduce((s, t) => s + t.price, 0)

  const proceedToBook = () => {
    sessionStorage.setItem('cart', JSON.stringify(cart))
    navigate('/patient/book')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lab Tests</h1>
        <p className="text-gray-500 text-sm mt-1">Browse and select tests to book from home</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input className="input pl-9" placeholder="Search tests (e.g. CBC, thyroid, glucose…)"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === c ? 'bg-lab text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-lab hover:text-lab'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FlaskConical size={48} className="mx-auto mb-3 opacity-30" />
          <p>No tests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map(test => (
            <div key={test._id} className={`card p-5 transition-all ${inCart(test._id) ? 'ring-2 ring-lab' : 'hover:shadow-md'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[test.category] || 'bg-gray-100 text-gray-600'}`}>
                  {test.category}
                </span>
                <span className="text-lg font-bold text-lab">₹{test.price}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{test.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Clock size={11} />{test.turnaroundTime}</span>
                <span className="flex items-center gap-1"><Droplets size={11} />{test.sampleType}</span>
              </div>
              <button onClick={() => toggle(test)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${inCart(test._id) ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-lab hover:bg-blue-100'}`}>
                {inCart(test._id) ? <><Minus size={14} /> Remove</> : <><Plus size={14} /> Add to Cart</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-lab-dark text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span className="font-medium">{cart.length} test{cart.length > 1 ? 's' : ''} selected</span>
            </div>
            <div className="text-blue-200">₹{total.toLocaleString('en-IN')}</div>
            <button onClick={proceedToBook} className="bg-white text-lab px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors">
              Book Now →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}