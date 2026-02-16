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
      color: 'from-blue-400 to-cyan-400'
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
      color: 'from-purple-400 to-pink-400'
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
      color: 'from-orange-400 to-red-400'
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
      color: 'from-green-400 to-emerald-400'
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
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
          Summary Settings
        </h3>
        <p className="text-slate-600 text-xs">
          Select summary type
        </p>
      </div>

      {/* Radio Card Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {summaryTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`relative p-3 rounded-lg border-2 transition-all text-left ${
              selectedType === type.id
                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-2">
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${type.color} text-white flex items-center justify-center shadow-md`}>
                {type.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                  {type.name}
                </h4>
                <p className="text-xs text-slate-600">
                  {type.description}
                </p>
              </div>

              {/* Radio Indicator */}
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-300 bg-white'
              }`}>
                {selectedType === type.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </div>
            </div>

            {/* Selected Badge */}
            {selectedType === type.id && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500 text-white shadow-md">
                  Selected
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-700 font-medium">
              {selectedType === 'short' && 'Perfect for quick understanding and time-constrained reading.'}
              {selectedType === 'detailed' && 'Best for in-depth learning and comprehensive understanding.'}
              {selectedType === 'exam' && 'Ideal for exam preparation with focus on important topics.'}
              {selectedType === 'revision' && 'Great for last-minute revision and memory recall.'}
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 text-sm"
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
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Summary
          </>
        )}
      </button>
    </div>
  )
}

export default SummaryConfig
