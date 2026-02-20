import React, { useState } from 'react'

function PPTConfig({ contentId, onGenerate, loading }) {
  const [slideCount, setSlideCount] = useState(10)
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [includeImages, setIncludeImages] = useState(true)

  const themes = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Bold layout with strong typographic hierarchy',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A',
      preview: 'Blue & Indigo'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Understated layout with generous white space',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A',
      preview: 'Gray & White'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Structured layout suited to formal presentations',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A',
      preview: 'Navy Blue'
    }
  ]

  const slideCountOptions = [
    { value: 5,  label: '5 Slides',  description: 'Brief overview' },
    { value: 10, label: '10 Slides', description: 'Standard length' },
    { value: 15, label: '15 Slides', description: 'Extended coverage' },
    { value: 20, label: '20 Slides', description: 'Full depth' }
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
        <h3 className="text-lg font-semibold text-[#111827] mb-1">
          Presentation
        </h3>
        <p className="text-[#6B7280] text-xs">
          Configure slide layout and theme.
        </p>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Choose Theme
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative p-3 rounded-[8px] border transition-colors text-left ${
                selectedTheme === theme.id
                  ? 'border-[#1E3A8A] bg-[#EEF2FF]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-[6px] flex items-center justify-center" style={{ backgroundColor: theme.iconBg, color: theme.iconText }}>
                  {theme.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#111827] mb-0.5">
                    {theme.name}
                  </h4>
                  <p className="text-xs text-[#6B7280] mb-1">
                    {theme.description}
                  </p>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#F3F4F6] text-[#6B7280]">
                    {theme.preview}
                  </span>
                </div>

                {/* Radio Indicator */}
                <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedTheme === theme.id
                    ? 'border-[#1E3A8A] bg-[#1E3A8A]'
                    : 'border-[#D1D5DB] bg-white'
                }`}>
                  {selectedTheme === theme.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </div>
              </div>

              {/* Selected Badge */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1E3A8A] text-white">
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
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Number of Slides
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {slideCountOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSlideCount(option.value)}
              className={`p-3 rounded-[8px] border transition-colors ${
                slideCount === option.value
                  ? 'border-[#1E3A8A] bg-[#EEF2FF]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
              }`}
            >
              <div className="text-center">
                <p className="text-lg font-bold text-[#111827]">{option.label}</p>
                <p className="text-[10px] text-[#6B7280]">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Include Images Toggle */}
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#111827] mb-1">
                Include Images
              </h4>
              <p className="text-xs text-[#6B7280]">
                Add contextually relevant images to slides.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIncludeImages(!includeImages)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              includeImages ? 'bg-[#1E3A8A]' : 'bg-[#D1D5DB]'
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
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#6B7280]">
              Images are sourced from Unsplash/Pexels based on slide content.
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full h-10 px-4 rounded-[8px] font-medium text-white transition-colors flex items-center justify-center gap-2 text-sm ${
          loading
            ? 'bg-[#D1D5DB] cursor-not-allowed'
            : 'bg-[#1E3A8A] hover:bg-[#1C337A]'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Presentation...
          </>
        ) : (
          'Generate Presentation'
        )}
      </button>
    </div>
  )
}

export default PPTConfig
