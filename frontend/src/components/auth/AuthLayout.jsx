import React, { useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import Logo from '../common/Logo'

function AuthLayout({ initialTab = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialTab === 'login')

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle, #C7D2FE 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        backgroundColor: '#EEF2FF',
      }}
    >
      <div className="relative w-full max-w-sm">
        <div className="flex justify-start mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white border border-[#C7D2FE] rounded-[8px] shadow-sm overflow-hidden">
          <div className="flex border-b border-[#E5E7EB]">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                isLogin
                  ? 'text-[#111827] border-b-2 border-[#1E3A8A]'
                  : 'text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                !isLogin
                  ? 'text-[#111827] border-b-2 border-[#1E3A8A]'
                  : 'text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-6">
            {isLogin ? <Login /> : <Signup />}
          </div>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-4">
          By continuing, you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
