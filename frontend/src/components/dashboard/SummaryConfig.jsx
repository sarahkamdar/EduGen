import React, { useState } from 'react'

function SummaryConfig({ contentId, onGenerate, loading }) {
  const [selectedType, setSelectedType] = useState('detailed')

  const summaryTypes = [
    {
      id: 'short',
      name: 'Short Overview',
      description: '3-5 sentences capturing key points',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
    },
    {
      id: 'detailed',
      name: 'Detailed Notes',
      description: 'Comprehensive summary with all important details',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
    },
    {
      id: 'exam',
      name: 'Exam-Oriented',
      description: 'Focus on exam topics and key concepts',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
    },
    {
      id: 'revision',
      name: 'Revision Bullets',
      description: 'Quick bullet points for fast revision',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
    }
  ]

  const handleGenerate = () => {
    if (onGenerate && !loading) {
      const formData = new FormData()
      formData.append('content_id', contentId)
      formData.append('summary_type', selectedType)
      onGenerate(formData)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[#111827] mb-1">
          Summary
        </h3>
        <p className="text-[#6B7280] text-xs">
          Choose a format.
        </p>
      </div>

      {/* Radio Card Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {summaryTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`relative p-3 rounded-[8px] border transition-colors text-left ${
              selectedType === type.id
                ? 'border-[#1E3A8A] bg-[#EEF2FF]'
                : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
            }`}
          >
            <div className="flex items-start gap-2">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-[6px] flex items-center justify-center" style={{ backgroundColor: type.iconBg, color: type.iconText }}>
                {type.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#111827] mb-0.5">
                  {type.name}
                </h4>
                <p className="text-xs text-[#6B7280]">
                  {type.description}
                </p>
              </div>

              {/* Radio Indicator */}
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedType === type.id
                  ? 'border-[#1E3A8A] bg-[#1E3A8A]'
                  : 'border-[#D1D5DB] bg-white'
              }`}>
                {selectedType === type.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </div>
            </div>

            {/* Selected Badge */}
            {selectedType === type.id && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1E3A8A] text-white shadow-md">
                  Selected
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#374151] font-medium">
              {selectedType === 'short' && 'A brief overview for quick reference.'}
              {selectedType === 'detailed' && 'Comprehensive notes covering main concepts and supporting detail.'}
              {selectedType === 'exam' && 'Focused on assessable content and commonly tested concepts.'}
              {selectedType === 'revision' && 'Condensed bullet points for rapid review.'}
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full h-10 bg-[#1E3A8A] text-white px-4 rounded-[8px] font-medium hover:bg-[#1C337A] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Summary...
          </>
        ) : (
          'Generate Summary'
        )}
      </button>
    </div>
  )
}

export default SummaryConfig
