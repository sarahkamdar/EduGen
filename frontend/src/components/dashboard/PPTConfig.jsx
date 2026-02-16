import React, { useState } from 'react'

function PPTConfig({ contentId, onGenerate, loading }) {
  const [slideCount, setSlideCount] = useState(10)
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [includeImages, setIncludeImages] = useState(true)

  const themes = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean design with bold colors and gradients',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      color: 'from-blue-400 to-indigo-500',
      preview: 'Blue & Indigo'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant with subtle colors',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      color: 'from-gray-400 to-slate-500',
      preview: 'Gray & White'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Professional look for corporate presentations',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-navy-400 to-blue-600',
      preview: 'Navy Blue'
    }
  ]

  const slideCountOptions = [
    { value: 5, label: '5 Slides', description: 'Quick overview' },
    { value: 10, label: '10 Slides', description: 'Standard presentation' },
    { value: 15, label: '15 Slides', description: 'Detailed content' },
    { value: 20, label: '20 Slides', description: 'Comprehensive' }
  ]

  const handleGenerate = () => {
    if (onGenerate && !loading) {
      const formData = new FormData()
      formData.append('content_id', contentId)
      formData.append('slide_count', slideCount)
      formData.append('theme', selectedTheme)
      formData.append('include_images', includeImages)
      onGenerate(formData)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
          Presentation Settings
        </h3>
        <p className="text-slate-600 text-xs">
          Configure slide options
        </p>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Choose Theme
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                selectedTheme === theme.id
                  ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${theme.color} text-white flex items-center justify-center shadow-md`}>
                  {theme.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                    {theme.name}
                  </h4>
                  <p className="text-xs text-slate-600 mb-1">
                    {theme.description}
                  </p>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600">
                    {theme.preview}
                  </span>
                </div>

                {/* Radio Indicator */}
                <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedTheme === theme.id
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-slate-300 bg-white'
                }`}>
                  {selectedTheme === theme.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </div>
              </div>

              {/* Selected Badge */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500 text-white shadow-md">
                    Selected
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Slide Count Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Number of Slides
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {slideCountOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSlideCount(option.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                slideCount === option.value
                  ? 'border-orange-400 bg-orange-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-orange-300'
              }`}
            >
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{option.label}</p>
                <p className="text-[10px] text-slate-600">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Include Images Toggle */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Include Images
              </h4>
              <p className="text-xs text-slate-600">
                Automatically add relevant images to slides for better visual appeal
              </p>
            </div>
          </div>
          <button
            onClick={() => setIncludeImages(!includeImages)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              includeImages ? 'bg-orange-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeImages ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-600">
              Images are sourced from Unsplash/Pexels based on slide content.
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          loading
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating Presentation...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <span>Generate Presentation</span>
          </div>
        )}
      </button>
    </div>
  )
}

export default PPTConfig
