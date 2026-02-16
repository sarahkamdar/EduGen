import React from 'react'
import Logo from '../common/Logo'

const Navbar = ({ onSignIn }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" />
          
          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onSignIn}
              className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
