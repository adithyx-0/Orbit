import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Subscriptions from './pages/Subscriptions.jsx'
import Analytics from './pages/Analytics.jsx'
import Goals from './pages/Goals.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public — unauthenticated entry points */}
      <Route path="/"       element={<Onboarding />} />
      <Route path="/login"  element={<Login />} />

      {/* Protected app shell */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/analytics"     element={<Analytics />} />
        <Route path="/goals"         element={<Goals />} />
        <Route path="/settings"      element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
