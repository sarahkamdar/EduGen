import React, { useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import Logo from '../common/Logo'

function AuthLayout() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border-2 border-white overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-xs font-semibold transition-all ${
                isLogin
                  ? 'text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text border-b-2 border-purple-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-xs font-semibold transition-all ${
                !isLogin
                  ? 'text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text border-b-2 border-purple-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6">
            {isLogin ? <Login /> : <Signup />}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
