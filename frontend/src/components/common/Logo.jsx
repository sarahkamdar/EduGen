import React from 'react'

function Logo({ size = 'md', showText = true, variant = 'default' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[8px]' },
    md: { icon: 36, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 64, text: 'text-3xl', sub: 'text-sm' }
  }

  const config = sizes[size] || sizes.md

  const textColorClass = variant === 'light' 
    ? 'text-white' 
    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent'

  const subTextColorClass = variant === 'light' 
    ? 'text-indigo-200' 
    : 'text-slate-500'

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon */}
      <div 
        className="relative flex-shrink-0"
        style={{ width: config.icon, height: config.icon }}
      >
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>
          </defs>
          
          {/* Main circle background */}
          <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" />
          
          {/* Book shape - left page */}
          <path 
            d="M12 14C12 12.8954 12.8954 12 14 12H22V34H14C12.8954 34 12 33.1046 12 32V14Z" 
            fill="white" 
            fillOpacity="0.95"
          />
          
          {/* Book shape - right page */}
          <path 
            d="M26 12H32C33.1046 12 34 12.8954 34 14V32C34 33.1046 33.1046 34 32 34H26V12Z" 
            fill="white" 
            fillOpacity="0.85"
          />
          
          {/* Book spine */}
          <rect x="22" y="12" width="4" height="22" fill="url(#bookGradient)" />
          
          {/* Sparkle/AI element - top right */}
          <circle cx="36" cy="12" r="3" fill="#FCD34D" />
          <path 
            d="M36 8V10M36 14V16M32 12H34M38 12H40" 
            stroke="#FCD34D" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          
          {/* Text lines on left page */}
          <rect x="14" y="16" width="6" height="1.5" rx="0.75" fill="#C7D2FE" />
          <rect x="14" y="20" width="5" height="1.5" rx="0.75" fill="#C7D2FE" />
          <rect x="14" y="24" width="6" height="1.5" rx="0.75" fill="#C7D2FE" />
          <rect x="14" y="28" width="4" height="1.5" rx="0.75" fill="#C7D2FE" />
          
          {/* Checkmark on right page */}
          <path 
            d="M28 22L30 24L33 20" 
            stroke="#4F46E5" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${config.text} font-bold ${textColorClass} leading-tight`}>
            EduGen
          </h1>
          <p className={`${config.sub} ${subTextColorClass} font-medium leading-tight`}>
            Learning Platform
          </p>
        </div>
      )}
    </div>
  )
}

export default Logo
