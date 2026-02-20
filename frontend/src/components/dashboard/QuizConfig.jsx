import React, { useState } from 'react'

function QuizConfig({ contentId, onGenerate, loading }) {
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('Medium')
  const [mode, setMode] = useState('Practice')

  const difficultyLevels = [
    {
      id: 'Easy',
      name: 'Easy',
      description: 'Recall and recognition',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
    },
    {
      id: 'Medium',
      name: 'Medium',
      description: 'Application and analysis',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
    },
    {
      id: 'Hard',
      name: 'Hard',
      description: 'Evaluation and synthesis',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
    }
  ]

  const modes = [
    {
      id: 'Practice',
      name: 'Practice Mode',
      description: 'Correct answer shown after each question',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
    },
    {
      id: 'Test',
      name: 'Test Mode',
      description: 'Results shown after full submission',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      iconBg: '#EEF2FF', iconText: '#1E3A8A'
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
        <h3 className="text-lg font-semibold text-[#111827] mb-1">
          Quiz
        </h3>
        <p className="text-[#6B7280] text-xs">
          Set question count, difficulty, and mode.
        </p>
      </div>

      {/* Number of Questions */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4">
        <label className="block text-sm font-medium text-[#374151] mb-2">
          Number of Questions
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="5"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#1E3A8A]"
          />
          <div className="flex-shrink-0 w-12 h-12 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center text-[#1E3A8A] font-bold text-lg">
            {numQuestions}
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-1.5">5 – 20 questions</p>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-bold text-[#111827] mb-2">
          Difficulty Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {difficultyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setDifficulty(level.id)}
              className={`relative p-2.5 rounded-[8px] border transition-colors text-left ${
                difficulty === level.id
                  ? 'border-[#1E3A8A] bg-[#EEF2FF]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-[6px] flex items-center justify-center" style={{ backgroundColor: level.iconBg, color: level.iconText }}>
                  {level.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#111827]">
                    {level.name}
                  </h4>
                  <p className="text-[10px] text-[#6B7280]">
                    {level.description}
                  </p>
                </div>
              </div>
              {difficulty === level.id && (
                <div className="absolute top-1.5 right-1.5">
                  <div className="w-4 h-4 bg-[#1E3A8A] rounded-full flex items-center justify-center">
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
        <label className="block text-sm font-bold text-[#111827] mb-2">
          Quiz Mode
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modes.map((quizMode) => (
            <button
              key={quizMode.id}
              onClick={() => setMode(quizMode.id)}
              className={`relative p-3 rounded-[8px] border transition-colors text-left ${
                mode === quizMode.id
                  ? 'border-[#1E3A8A] bg-[#EEF2FF]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-[6px] flex items-center justify-center" style={{ backgroundColor: quizMode.iconBg, color: quizMode.iconText }}>
                  {quizMode.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#111827] mb-0.5">
                    {quizMode.name}
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    {quizMode.description}
                  </p>
                </div>
              </div>
              {mode === quizMode.id && (
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
              {mode === 'Practice' 
                ? 'The correct answer is revealed immediately after each response.' 
                : 'All answers are withheld until the quiz is submitted.'}
            </p>
          </div>
        </div>
      </div>

      {/* Token Limit Warning */}
      {numQuestions > 7 && (
        <div className="bg-[#EEF2FF] border border-[#FCD34D] rounded-[8px] p-3">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-yellow-800 font-semibold mb-0.5">High question count</p>
              <p className="text-xs text-yellow-700">
                For lengthy content, 5 – 7 questions is recommended. Higher counts may exceed API limits.
              </p>
            </div>
          </div>
        </div>
      )}

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
            Generating Quiz...
          </>
        ) : (
          'Generate Quiz'
        )}
      </button>
    </div>
  )
}

export default QuizConfig
