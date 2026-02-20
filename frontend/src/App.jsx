import React, { useState, useEffect } from 'react'
import HomePage from './components/landing/HomePage'
import AuthLayout from './components/auth/AuthLayout'
import DashboardLayout from './components/dashboard/DashboardLayout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      setShowAuth(false)
    }
    setLoading(false)
  }, [])

  const handleNavigateToAuth = (tab = 'login') => {
    setAuthTab(tab)
    setShowAuth(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#111827]"></div>
          <p className="mt-4 text-[#6B7280]">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <DashboardLayout />
  }

  if (showAuth) {
    return <AuthLayout key={authTab} initialTab={authTab} />
  }

  return <HomePage onNavigateToAuth={handleNavigateToAuth} onGetStarted={() => handleNavigateToAuth('signup')} />
}

export default App
