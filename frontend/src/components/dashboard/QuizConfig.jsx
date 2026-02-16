import React, { useState } from 'react'

function QuizConfig({ contentId, onGenerate, loading }) {
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('Medium')
  const [mode, setMode] = useState('Practice')

  const difficultyLevels = [
    {
      id: 'Easy',
      name: 'Easy',
      description: 'Basic questions for beginners',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-400 to-emerald-400'
    },
    {
      id: 'Medium',
      name: 'Medium',
      description: 'Moderate challenge level',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-yellow-400 to-orange-400'
    },
    {
      id: 'Hard',
      name: 'Hard',
      description: 'Advanced and challenging',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-red-400 to-pink-400'
    }
  ]

  const modes = [
    {
      id: 'Practice',
      name: 'Practice Mode',
      description: 'Learn with immediate feedback',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'Test',
      name: 'Test Mode',
      description: 'Simulate real exam conditions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'from-purple-400 to-pink-400'
    }
  ]

  const handleGenerate = () => {
    if (onGenerate && !loading) {
      const formData = new FormData()
      formData.append('content_id', contentId)
      formData.append('number_of_questions', numQuestions.toString())
      formData.append('difficulty', difficulty)
      formData.append('mode', mode)
      onGenerate(formData)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
          Quiz Settings
        </h3>
        <p className="text-slate-600 text-xs">
          Configure quiz parameters
        </p>
      </div>

      {/* Number of Questions */}
      <div className="bg-white rounded-lg border-2 border-green-200 p-4 shadow-md">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Number of Questions
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="5"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
            {numQuestions}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">Slide to select 5-20 questions</p>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Difficulty Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {difficultyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setDifficulty(level.id)}
              className={`relative p-2.5 rounded-lg border-2 transition-all text-left ${
                difficulty === level.id
                  ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`flex-shrink-0 w-7 h-7 rounded-md bg-gradient-to-br ${level.color} text-white flex items-center justify-center shadow-md`}>
                  {level.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900">
                    {level.name}
                  </h4>
                  <p className="text-[10px] text-slate-600">
                    {level.description}
                  </p>
                </div>
              </div>
              {difficulty === level.id && (
                <div className="absolute top-1.5 right-1.5">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Mode */}
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Quiz Mode
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modes.map((quizMode) => (
            <button
              key={quizMode.id}
              onClick={() => setMode(quizMode.id)}
              className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                mode === quizMode.id
                  ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${quizMode.color} text-white flex items-center justify-center shadow-md`}>
                  {quizMode.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                    {quizMode.name}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {quizMode.description}
                  </p>
                </div>
              </div>
              {mode === quizMode.id && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500 text-white shadow-md">
                    Selected
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-700 font-medium">
              {mode === 'Practice' 
                ? 'Practice mode provides instant feedback to help you learn as you go.' 
                : 'Test mode simulates real exam conditions with no immediate feedback.'}
            </p>
          </div>
        </div>
      </div>

      {/* Token Limit Warning */}
      {numQuestions > 7 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-yellow-800 font-semibold mb-0.5">Large Question Count</p>
              <p className="text-xs text-yellow-700">
                For long content, use 5-7 questions to avoid API limits. Higher counts may fail.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Quiz...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Quiz
          </>
        )}
      </button>
    </div>
  )
}

export default QuizConfig
