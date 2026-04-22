import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Layout from './components/Layout'

import PatientDashboard from './pages/patient/Dashboard'
import TestCatalog from './pages/patient/TestCatalog'
import BookTest from './pages/patient/BookTest'
import MyBookings from './pages/patient/MyBookings'
import BookingDetail from './pages/patient/BookingDetail'
import ReportView from './pages/patient/ReportView'
import Profile from './pages/patient/Profile'

import StaffDashboard from './pages/staff/Dashboard'
import StaffBookings from './pages/staff/Bookings'
import StaffBookingDetail from './pages/staff/BookingDetail'
import EnterResults from './pages/staff/EnterResults'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminReports from './pages/admin/Reports'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lab"></div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/landing" replace />
  if (user.role === 'patient') return <Navigate to="/patient/dashboard" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/staff/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Patient Routes */}
          <Route path="/patient" element={
            <PrivateRoute roles={['patient']}>
              <Layout role="patient" />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="tests" element={<TestCatalog />} />
            <Route path="book" element={<BookTest />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="report/:bookingId" element={<ReportView />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Staff Routes */}
          <Route path="/staff" element={
            <PrivateRoute roles={['staff']}>
              <Layout role="staff" />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="bookings" element={<StaffBookings />} />
            <Route path="bookings/:id" element={<StaffBookingDetail />} />
            <Route path="bookings/:id/results" element={<EnterResults />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <Layout role="admin" />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bookings" element={<StaffBookings />} />
            <Route path="bookings/:id" element={<StaffBookingDetail />} />
            <Route path="bookings/:id/results" element={<EnterResults />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
