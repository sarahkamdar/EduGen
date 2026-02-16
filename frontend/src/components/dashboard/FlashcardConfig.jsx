import React, { useState } from 'react'

function FlashcardConfig({ contentId, onGenerate, loading }) {
  const [selectedType, setSelectedType] = useState('Concept → Definition')
  const [numberOfCards, setNumberOfCards] = useState(10)

  const flashcardTypes = [
    {
      id: 'Concept → Definition',
      name: 'Concept → Definition',
      description: 'Learn key concepts with clear definitions',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-purple-400 to-pink-400'
    },
    {
      id: 'Question → Answer',
      name: 'Question → Answer',
      description: 'Test yourself with Q&A format',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'Term → Explanation',
      name: 'Term → Explanation',
      description: 'Understand terminology with detailed explanations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-indigo-400 to-purple-400'
    },
    {
      id: 'Why → Explanation',
      name: 'Why → Explanation',
      description: 'Understand the reasoning behind concepts',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'from-orange-400 to-red-400'
    },
    {
      id: 'How → Steps',
      name: 'How → Steps',
      description: 'Learn procedures with step-by-step guides',
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
      formData.append('flashcard_type', selectedType)
      formData.append('number_of_cards', numberOfCards)
      onGenerate(formData)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
          Flashcard Settings
        </h3>
        <p className="text-slate-600 text-xs">
          Select flashcard type
        </p>
      </div>

      {/* Radio Card Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {flashcardTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`relative p-3 rounded-lg border-2 transition-all text-left ${
              selectedType === type.id
                ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'
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
                  ? 'border-purple-500 bg-purple-500'
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500 text-white shadow-md">
                  Selected
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-700 font-medium">
              {selectedType === 'Concept → Definition' && 'Perfect for learning fundamental concepts and their meanings.'}
              {selectedType === 'Question → Answer' && 'Great for active recall and testing your knowledge.'}
              {selectedType === 'Term → Explanation' && 'Ideal for understanding technical terms and jargon.'}
              {selectedType === 'Why → Explanation' && 'Best for understanding the rationale and reasoning behind concepts.'}
              {selectedType === 'How → Steps' && 'Excellent for learning processes and procedures step by step.'}
            </p>
          </div>
        </div>
      </div>

      {/* Number of Cards Input */}
      <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Number of Flashcards
        </label>
        <input
          type="number"
          min="5"
          max="20"
          value={numberOfCards}
          onChange={(e) => setNumberOfCards(Math.min(20, Math.max(5, parseInt(e.target.value) || 10)))}
          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        <p className="text-xs text-slate-500 mt-1">Choose between 5 and 20 flashcards</p>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Flashcards...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Flashcards
          </>
        )}
      </button>
    </div>
  )
}

export default FlashcardConfig
