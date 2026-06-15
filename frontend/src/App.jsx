import React, { useState, useEffect } from 'react'
import HomePage from './components/landing/HomePage'
import AuthLayout from './components/auth/AuthLayout'
import DashboardLayout from './components/dashboard/DashboardLayout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [loading, setLoading] = useState(true)

  const hasValidToken = () => {
    const token = localStorage.getItem('token')
    if (!token) return false

    try {
      const payloadBase64 = token.split('.')[1]
      if (!payloadBase64) return false
      const payload = JSON.parse(atob(payloadBase64))

      if (payload.exp && Date.now() >= payload.exp * 1000) {
        localStorage.removeItem('token')
        return false
      }

      return true
    } catch {
      localStorage.removeItem('token')
      return false
    }
  }

  useEffect(() => {
    const syncAuthState = () => {
      const valid = hasValidToken()
      setIsAuthenticated(valid)

      if (valid) {
        setShowAuth(false)
      }
    }

    syncAuthState()
    setLoading(false)
    window.addEventListener('auth-changed', syncAuthState)
    window.addEventListener('storage', syncAuthState)

    return () => {
      window.removeEventListener('auth-changed', syncAuthState)
      window.removeEventListener('storage', syncAuthState)
    }

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
