import React, { useState, useEffect } from 'react'
import HomePage from './components/landing/HomePage'
import AuthLayout from './components/auth/AuthLayout'
import DashboardLayout from './components/dashboard/DashboardLayout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      setShowAuth(false)
    }
    setLoading(false)
  }, [])

  const handleNavigateToAuth = () => {
    setShowAuth(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <DashboardLayout />
  }

  if (showAuth) {
    return <AuthLayout />
  }

  return <HomePage onNavigateToAuth={handleNavigateToAuth} />
}

export default App
