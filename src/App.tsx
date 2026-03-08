import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import MonthEndReport from './pages/MonthEndReport'
import PricingCalendar from './pages/PricingCalendar'

const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem('authToken'))
}

type ProtectedRouteProps = {
  children: ReactElement
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing-calendar" element={<PricingCalendar />} />
        <Route path="/month-end-report" element={<MonthEndReport />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
