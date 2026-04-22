import { Link } from 'react-router-dom'
import { Microscope, Home, FileText, Bell, Download, Shield, Clock, ChevronRight } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
        <div className="flex items-center gap-2">
          <Microscope size={24} className="text-lab" />
          <span className="text-lg font-bold text-lab">MedIntel</span>
        </div>
        <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-lab transition-colors">Log In</Link>
          <Link to="/register" className="btn-primary text-sm px-5">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-lab-dark via-lab to-blue-500 text-white py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now available — book from home
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Lab Tests Delivered<br />
            <span className="text-blue-200">To Your Doorstep</span>
          </h1>
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Skip the clinic queues. Book any lab test from home, get samples collected at your door, and receive easy-to-understand reports online.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="bg-white text-lab px-8 py-3.5 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors flex items-center gap-2">
              Book First Test <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="border border-white/40 text-white px-8 py-3.5 rounded-xl font-medium text-base hover:bg-white/10 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-3">Get your lab tests done in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🔬', title: 'Browse Tests', desc: 'Choose from a wide range of diagnostic tests by category' },
              { step: '02', icon: '📅', title: 'Book & Schedule', desc: 'Enter your address and pick a convenient time slot' },
              { step: '03', icon: '🏠', title: 'Home Collection', desc: 'Our trained staff visits and collects your sample' },
              { step: '04', icon: '📊', title: 'Get Report', desc: 'View and download your easy-to-understand report online' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                <div className="text-xs font-bold text-lab/40 mb-3">{s.step}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose MedIntel?</h2>
            <p className="text-gray-500 mt-3">Everything you need, nothing you don't</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Home, color: 'bg-blue-50 text-lab', title: 'Home Sample Collection', desc: 'No need to visit a lab. Our phlebotomists come to you at your preferred time.' },
              { icon: FileText, color: 'bg-green-50 text-green-700', title: 'Easy-to-Read Reports', desc: 'Reports with Normal / High / Low indicators and simple explanations anyone can understand.' },
              { icon: Bell, color: 'bg-purple-50 text-purple-700', title: 'Real-time Updates', desc: 'Get notified at every step — from booking confirmation to report availability.' },
              { icon: Download, color: 'bg-amber-50 text-amber-700', title: 'PDF Downloads', desc: 'Download and share your lab reports anytime, anywhere, in a print-ready format.' },
              { icon: Shield, color: 'bg-red-50 text-red-700', title: 'Secure & Private', desc: 'Your health data is protected. Only you can access your reports and booking history.' },
              { icon: Clock, color: 'bg-indigo-50 text-indigo-700', title: 'Fast Turnaround', desc: 'Most tests are processed within 4-24 hours with same-day collection available.' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test categories */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Tests We Offer</h2>
            <p className="text-gray-500 mt-3">Covering all major diagnostic categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji: '🩸', name: 'Haematology', desc: 'CBC, Blood Count' },
              { emoji: '🧪', name: 'Biochemistry', desc: 'LFT, KFT, Vitamins' },
              { emoji: '🍬', name: 'Diabetes', desc: 'Glucose, HbA1c' },
              { emoji: '⚡', name: 'Hormones', desc: 'Thyroid, Cortisol' },
              { emoji: '🦠', name: 'Microbiology', desc: 'Culture, COVID' },
              { emoji: '💉', name: 'Immunology', desc: 'Dengue, HIV' },
              { emoji: '❤️', name: 'Cardiac', desc: 'Troponin, CK-MB' },
              { emoji: '🔬', name: 'Urine', desc: 'Routine, Culture' },
            ].map(c => (
              <div key={c.name} className="bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-lab hover:shadow-sm transition-all">
                <div className="text-3xl mb-2">{c.emoji}</div>
                <div className="font-semibold text-gray-900 text-sm">{c.name}</div>
                <div className="text-xs text-gray-400 mt-1">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 bg-lab-dark text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-blue-200 mb-8 text-lg">Create your free account and book your first test today.</p>
          <Link to="/register" className="bg-white text-lab px-10 py-4 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-gray-100 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Microscope size={16} className="text-lab" />
          <span className="font-semibold text-lab">MedIntel</span>
        </div>
        © 2024 MedIntel Diagnostics. All rights reserved.
      </footer>

    </div>
  )
}