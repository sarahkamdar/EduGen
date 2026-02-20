import React from 'react'
import Logo from '../common/Logo'

const Navbar = ({ onSignIn, onGetStarted }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#C7D2FE]" style={{ backgroundImage: 'radial-gradient(circle, #C7D2FE 1px, transparent 1px)', backgroundSize: '22px 22px', backgroundColor: '#EEF2FF' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Logo size="md" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSignIn('login')}
              className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1E3A8A] rounded-[8px] hover:bg-[#1C337A] transition-colors"
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
