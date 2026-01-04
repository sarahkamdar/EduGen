import React, { useState, useEffect } from 'react'

function ResultRenderer({ activeAction, resultData, onClose }) {
  const [currentCard, setCurrentCard] = useState(0)
  const [flippedCards, setFlippedCards] = useState({})
  const [userAnswers, setUserAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)

  // Initialize quiz state when viewing from history
  useEffect(() => {
    if (activeAction === 'quiz' && resultData) {
      // If user_answers exist (test mode from history), load them and show results
      if (resultData.user_answers) {
        setUserAnswers(resultData.user_answers)
        setShowResults(true)
        setScoreSaved(true)
      } else {
        // Reset for new quiz attempt
        setUserAnswers({})
        setShowResults(false)
        setScoreSaved(false)
      }
    }
  }, [activeAction, resultData])

  if (!activeAction || !resultData) return null

  // Action name mapping
  const actionNames = {
    summary: 'Summary',
    flashcards: 'Flashcards',
    quiz: 'Quiz',
    presentation: 'Presentation',
    chatbot: 'Chatbot'
  }

  // Action icon mapping
  const actionIcons = {
    summary: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    flashcards: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    quiz: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    presentation: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    chatbot: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )
  }

  // Action color schemes
  const colorSchemes = {
    summary: {
      gradient: 'from-blue-600 to-cyan-600',
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      button: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
    },
    flashcards: {
      gradient: 'from-purple-600 to-pink-600',
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      button: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    },
    quiz: {
      gradient: 'from-green-600 to-emerald-600',
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      button: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
    },
    presentation: {
      gradient: 'from-orange-600 to-red-600',
      bg: 'from-orange-50 to-red-50',
      border: 'border-orange-200',
      button: 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
    },
    chatbot: {
      gradient: 'from-indigo-600 to-purple-600',
      bg: 'from-indigo-50 to-purple-50',
      border: 'border-indigo-200',
      button: 'from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
    }
  }

  const colors = colorSchemes[activeAction] || colorSchemes.summary

  // Flashcard flip handler
  const toggleFlip = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Quiz answer handler
  const handleAnswerSelect = (questionId, answer) => {
    if (!showResults) {
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }))
    }
  }

  // Quiz submit handler
  const handleSubmitQuiz = async () => {
    setShowResults(true)
    
    // Calculate score
    let correct = 0
    const quiz = resultData.quiz?.quiz || resultData.quiz || []
    quiz.forEach(q => {
      if (userAnswers[q.id] === q.correct_answer) correct++
    })
    const total = quiz.length
    const percentage = Math.round((correct / total) * 100)
    
    // Check if test mode
    const quizMode = resultData.mode || 'Practice'
    const isTestMode = quizMode.toLowerCase() === 'test'
    
    // Save score and user answers to backend if not already saved
    if (!scoreSaved && resultData.output_id) {
      try {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('score', correct)
        formData.append('total', total)
        formData.append('percentage', percentage)
        
        // If test mode, also save user answers
        if (isTestMode) {
          formData.append('user_answers', JSON.stringify(userAnswers))
        }
        
        await fetch(`/content/output/${resultData.output_id}/score`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        setScoreSaved(true)
      } catch (error) {
        console.error('Failed to save score:', error)
      }
    }
  }

  // Format markdown-like text
  const formatText = (text) => {
    if (!text) return null

    // Split by lines
    const lines = text.split('\n')
    const elements = []
    let listItems = []
    let currentListType = null

    const flushList = () => {
      if (listItems.length > 0) {
        if (currentListType === 'bullet') {
          elements.push(
            <ul key={`list-${elements.length}`} className="ml-6 mb-4 space-y-1.5">
              {listItems.map((item, idx) => (
                <li key={idx} className="text-slate-700 text-sm leading-relaxed list-disc">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          )
        } else if (currentListType === 'numbered') {
          elements.push(
            <ol key={`list-${elements.length}`} className="ml-6 mb-4 space-y-1.5">
              {listItems.map((item, idx) => (
                <li key={idx} className="text-slate-700 text-sm leading-relaxed list-decimal">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ol>
          )
        }
        listItems = []
        currentListType = null
      }
    }

    const parseInlineFormatting = (text) => {
      const parts = []
      let remaining = text
      let key = 0

      while (remaining.length > 0) {
        // Bold (**text**)
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
        if (boldMatch && boldMatch.index === 0) {
          parts.push(<strong key={key++} className="font-bold text-slate-900">{boldMatch[1]}</strong>)
          remaining = remaining.slice(boldMatch[0].length)
          continue
        }

        // Italic (*text*)
        const italicMatch = remaining.match(/\*([^*]+?)\*/)
        if (italicMatch && italicMatch.index === 0) {
          parts.push(<em key={key++} className="italic text-slate-700">{italicMatch[1]}</em>)
          remaining = remaining.slice(italicMatch[0].length)
          continue
        }

        // Code (`code`)
        const codeMatch = remaining.match(/`([^`]+?)`/)
        if (codeMatch && codeMatch.index === 0) {
          parts.push(
            <code key={key++} className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-xs font-mono">
              {codeMatch[1]}
            </code>
          )
          remaining = remaining.slice(codeMatch[0].length)
          continue
        }

        // Find next special character
        const nextSpecial = remaining.search(/[*`]/)
        if (nextSpecial === -1) {
          parts.push(remaining)
          break
        } else {
          parts.push(remaining.slice(0, nextSpecial))
          remaining = remaining.slice(nextSpecial)
        }
      }

      return parts.length > 0 ? parts : text
    }

    lines.forEach((line, index) => {
      // Skip empty lines
      if (line.trim() === '') {
        flushList()
        elements.push(<div key={`space-${index}`} className="h-2" />)
        return
      }

      // Headers (###)
      if (line.startsWith('###')) {
        flushList()
        elements.push(
          <h3 key={index} className="text-lg font-bold text-slate-900 mb-3 mt-4">
            {parseInlineFormatting(line.replace(/^###\s*/, ''))}
          </h3>
        )
      }
      // Headers (##)
      else if (line.startsWith('##')) {
        flushList()
        elements.push(
          <h2 key={index} className="text-xl font-bold text-slate-900 mb-3 mt-5">
            {parseInlineFormatting(line.replace(/^##\s*/, ''))}
          </h2>
        )
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line)) {
        if (currentListType !== 'numbered') {
          flushList()
          currentListType = 'numbered'
        }
        listItems.push(line.replace(/^\d+\.\s*/, ''))
      }
      // Bullet list (* or -)
      else if (/^[\*\-]\s/.test(line)) {
        if (currentListType !== 'bullet') {
          flushList()
          currentListType = 'bullet'
        }
        listItems.push(line.replace(/^[\*\-]\s*/, ''))
      }
      // Regular paragraph
      else {
        flushList()
        elements.push(
          <p key={index} className="text-slate-700 text-sm leading-relaxed mb-3">
            {parseInlineFormatting(line)}
          </p>
        )
      }
    })

    flushList()
    return elements
  }

  // Render Summary
  const renderSummary = () => {
    const summary = resultData.summary || ''
    const summaryType = resultData.summary_type || 'detailed'

    return (
      <div className="space-y-4">
        <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/80 rounded-full text-xs font-semibold text-slate-700 border border-slate-200">
              {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
            </span>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div className="text-slate-800">
              {formatText(summary)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Flashcards
  const renderFlashcards = () => {
    // Handle multiple possible response structures
    let flashcards = []
    
    if (resultData.flashcards) {
      if (Array.isArray(resultData.flashcards)) {
        // Direct array
        flashcards = resultData.flashcards
      } else if (resultData.flashcards.flashcards && Array.isArray(resultData.flashcards.flashcards)) {
        // Nested flashcards property
        flashcards = resultData.flashcards.flashcards
      } else if (typeof resultData.flashcards === 'object') {
        // Check if it's an object with raw_response (error case)
        if (resultData.flashcards.raw_response) {
          console.error('Flashcards generation failed - raw response:', resultData.flashcards.raw_response)
        }
      }
    }
    
    // Debug logging
    console.log('Flashcards resultData:', resultData)
    console.log('Extracted flashcards:', flashcards)
    
    if (flashcards.length === 0) {
      return (
        <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-8 text-center`}>
          <p className="text-slate-600 text-sm font-semibold mb-2">No flashcards generated</p>
          {resultData.flashcards?.raw_response && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ Generation Error</p>
              <p className="text-xs text-yellow-700">The AI returned invalid JSON. Try generating again.</p>
            </div>
          )}
          <details className="mt-4">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">Show debug info</summary>
            <pre className="mt-2 text-[10px] text-left bg-slate-100 p-2 rounded max-h-40 overflow-auto">
              {JSON.stringify(resultData, null, 2)}
            </pre>
          </details>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Card {currentCard + 1} of {flashcards.length}
          </span>
          <div className="flex gap-1">
            {flashcards.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 w-8 rounded-full transition-colors ${
                  idx === currentCard ? 'bg-purple-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Flashcard display */}
        <div
          className={`relative bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-8 min-h-[300px] cursor-pointer transition-transform hover:scale-[1.02]`}
          onClick={() => toggleFlip(currentCard)}
        >
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 bg-white/80 rounded-full text-xs font-semibold text-slate-700">
              {flippedCards[currentCard] ? 'Back' : 'Front'}
            </span>
          </div>

          <div className="flex items-center justify-center min-h-[250px] px-6">
            <div className="text-base text-slate-800 text-center leading-relaxed max-w-2xl">
              {formatText(flippedCards[currentCard] 
                ? flashcards[currentCard].back 
                : flashcards[currentCard].front
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <p className="text-xs text-slate-500 italic">Click to flip</p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
            disabled={currentCard === 0}
            className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1))}
            disabled={currentCard === flashcards.length - 1}
            className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${colors.button} text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm`}
          >
            Next →
          </button>
        </div>
      </div>
    )
  }

  // Render Quiz
  const renderQuiz = () => {
    // Handle multiple possible response structures
    let quiz = []
    
    if (resultData.quiz) {
      if (Array.isArray(resultData.quiz)) {
        // Direct array
        quiz = resultData.quiz
      } else if (resultData.quiz.quiz && Array.isArray(resultData.quiz.quiz)) {
        // Nested quiz property
        quiz = resultData.quiz.quiz
      } else if (typeof resultData.quiz === 'object') {
        // Check if it's an object with raw_response (error case)
        if (resultData.quiz.raw_response) {
          console.error('Quiz generation failed - raw response:', resultData.quiz.raw_response)
        }
      }
    }
    
    // Extract quiz mode (Practice or Test)
    const quizMode = resultData.mode || 'Practice'
    const isTestMode = quizMode.toLowerCase() === 'test'
    
    // Debug logging
    console.log('Quiz resultData:', resultData)
    console.log('Extracted quiz:', quiz)
    console.log('Quiz mode:', quizMode)
    
    if (quiz.length === 0) {
      const rawResponse = resultData.quiz?.raw_response || 'Unknown error'
      
      // Determine error type for better user guidance
      let errorTitle = '⚠️ Generation Error'
      let errorMessage = 'The AI could not generate quiz questions. Please try again.'
      let errorSuggestions = []
      
      if (rawResponse.includes('Empty response')) {
        errorTitle = '🚫 Empty Response'
        errorMessage = 'The AI model returned an empty response.'
        errorSuggestions = [
          'The content might be too long - try uploading a smaller document',
          'The free API tier may have rate limits - wait a moment and retry',
          'Try reducing the number of questions'
        ]
      } else if (rawResponse.includes('content_filter')) {
        errorTitle = '🔒 Content Filtered'
        errorMessage = 'The AI model filtered the content.'
        errorSuggestions = [
          'Your content may contain sensitive information',
          'Try uploading different content'
        ]
      } else if (rawResponse.includes('cut off') || rawResponse.includes('truncated') || rawResponse.includes('incomplete')) {
        errorTitle = '📏 Response Incomplete'
        errorMessage = 'The AI response was cut off mid-generation.'
        errorSuggestions = [
          'Reduce the number of questions (try 5-7 instead of 10)',
          'Upload a shorter document or text',
          'The free API has token limits that were exceeded'
        ]
      } else if (rawResponse.includes('length')) {
        errorTitle = '📏 Content Too Long'
        errorMessage = 'The response was truncated due to length.'
        errorSuggestions = [
          'Reduce the number of questions',
          'Upload a shorter document',
          'Try using only the first few pages of your content'
        ]
      } else if (rawResponse.includes('Error:')) {
        errorTitle = '❌ API Error'
        errorMessage = rawResponse
      } else if (rawResponse.includes('parse') || rawResponse.includes('malformed')) {
        errorTitle = '⚙️ Parsing Error'
        errorMessage = 'Failed to process the AI response.'
        errorSuggestions = [
          'Try generating again with fewer questions',
          'The response may have been incomplete',
          'Try with simpler content or shorter text'
        ]
      }
      
      return (
        <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-8 text-center`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <p className="text-slate-800 text-lg font-bold mb-2">{errorTitle}</p>
          <p className="text-slate-600 text-sm mb-4">{errorMessage}</p>
          
          {errorSuggestions.length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-xs font-semibold text-blue-900 mb-2">💡 Suggestions:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                {errorSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <details className="mt-4">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Technical details
            </summary>
            <pre className="mt-2 text-[10px] text-left bg-slate-100 p-3 rounded max-h-40 overflow-auto">
              {JSON.stringify(resultData, null, 2)}
            </pre>
          </details>
          
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            ← Back to Actions
          </button>
        </div>
      )
    }

    const calculateScore = () => {
      let correct = 0
      quiz.forEach(q => {
        if (userAnswers[q.id] === q.correct_answer) correct++
      })
      return { correct, total: quiz.length, percentage: Math.round((correct / quiz.length) * 100) }
    }

    const score = showResults ? calculateScore() : null

    // Practice Mode: Display all questions with answers and explanations directly
    if (!isTestMode) {
      return (
        <div className="space-y-4">
          {/* Mode badge */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border-2 border-blue-300">
              📚 Practice Mode - Study Guide
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {quiz.length} Questions
            </span>
          </div>

          {/* Questions with answers shown */}
          <div className="space-y-4">
            {quiz.map((question, qIndex) => (
              <div
                key={question.id}
                className="bg-white border-2 border-slate-200 rounded-xl p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-700">
                    {qIndex + 1}
                  </div>
                  <div className="flex-1 text-sm font-semibold text-slate-900 leading-relaxed">
                    {formatText(question.question)}
                  </div>
                </div>

                <div className="space-y-2">
                  {Object.entries(question.options).map(([key, value]) => {
                    const isCorrectOption = question.correct_answer === key
                    
                    return (
                      <div
                        key={key}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm ${
                          isCorrectOption
                            ? 'border-green-400 bg-green-50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            isCorrectOption
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-slate-300 text-slate-600'
                          }`}>
                            {key}
                          </span>
                          <div className="text-slate-800 flex-1">
                            {formatText(value)}
                          </div>
                          {isCorrectOption && (
                            <span className="flex-shrink-0 text-green-600 font-semibold text-xs">✓ Correct</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Show explanation if available */}
                {question.explanation && question.explanation.trim() !== '' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1.5">💡 Explanation:</p>
                    <div className="text-xs text-blue-800">
                      {formatText(question.explanation)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Test Mode: Interactive quiz with user selection and evaluation
    return (
      <div className="space-y-4">
        {/* Mode badge */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border-2 border-red-300">
            📝 Test Mode
          </span>
          {showResults && (
            <span className="text-xs text-slate-500 font-medium">
              Score: {score.correct}/{score.total} ({score.percentage}%)
            </span>
          )}
        </div>

        {/* Score display */}
        {showResults && (
          <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-6`}>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${
                score.percentage >= 80 ? 'from-green-500 to-emerald-500' :
                score.percentage >= 60 ? 'from-yellow-500 to-orange-500' :
                'from-red-500 to-pink-500'
              } rounded-full mb-3`}>
                <span className="text-3xl font-bold text-white">{score.percentage}%</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Test Completed!
              </h3>
              <p className="text-sm text-slate-600">
                You got {score.correct} out of {score.total} questions correct
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Grade: {score.percentage >= 90 ? 'A' : score.percentage >= 80 ? 'B' : score.percentage >= 70 ? 'C' : score.percentage >= 60 ? 'D' : 'F'}
              </p>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {quiz.map((question, qIndex) => {
            const isAnswered = userAnswers[question.id] !== undefined
            const isCorrect = userAnswers[question.id] === question.correct_answer
            
            return (
              <div
                key={question.id}
                className={`bg-white border-2 ${
                  showResults
                    ? isCorrect
                      ? 'border-green-300'
                      : 'border-red-300'
                    : 'border-slate-200'
                } rounded-xl p-5`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    showResults
                      ? isCorrect
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {qIndex + 1}
                  </div>
                  <div className="flex-1 text-sm font-semibold text-slate-900 leading-relaxed">
                    {formatText(question.question)}
                  </div>
                </div>

                <div className="space-y-2">
                  {Object.entries(question.options).map(([key, value]) => {
                    const isSelected = userAnswers[question.id] === key
                    const isCorrectOption = question.correct_answer === key
                    
                    return (
                      <button
                        key={key}
                        onClick={() => handleAnswerSelect(question.id, key)}
                        disabled={showResults}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                          showResults
                            ? isCorrectOption
                              ? 'border-green-400 bg-green-50'
                              : isSelected
                              ? 'border-red-400 bg-red-50'
                              : 'border-slate-200 bg-slate-50'
                            : isSelected
                            ? 'border-green-400 bg-green-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            showResults
                              ? isCorrectOption
                                ? 'border-green-500 bg-green-500 text-white'
                                : isSelected
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-slate-300 text-slate-600'
                              : isSelected
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-slate-300 text-slate-600'
                          }`}>
                            {key}
                          </span>
                          <div className="text-slate-800 flex-1">
                            {formatText(value)}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Test mode: Show what was wrong */}
                {showResults && !isCorrect && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-900 mb-1.5">Incorrect!</p>
                    <p className="text-xs text-red-800">
                      Your answer: <span className="font-semibold">{userAnswers[question.id]}</span>
                      {' '} • Correct answer: <span className="font-semibold">{question.correct_answer}</span>
                    </p>
                    {question.explanation && question.explanation.trim() !== '' && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <p className="text-xs text-red-800">{formatText(question.explanation)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Submit button */}
        {!showResults && (
          <div className="space-y-2">
            {Object.keys(userAnswers).length === quiz.length && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ Ready to Submit Test?</p>
                <p className="text-xs text-yellow-700">You won't be able to change your answers after submission.</p>
              </div>
            )}
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(userAnswers).length !== quiz.length}
              className={`w-full px-4 py-3 bg-gradient-to-r ${colors.button} text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm`}
            >
              {Object.keys(userAnswers).length === quiz.length
                ? '📝 Submit Test'
                : `Answer All Questions (${Object.keys(userAnswers).length}/${quiz.length})`
              }
            </button>
          </div>
        )}

        {/* Restart button */}
        {showResults && (
          <button
            onClick={() => {
              setUserAnswers({})
              setShowResults(false)
            }}
            className={`w-full px-4 py-3 bg-gradient-to-r ${colors.button} text-white rounded-lg font-semibold transition-all text-sm`}
          >
            🔄 Retake Test
          </button>
        )}
      </div>
    )
  }

  // Render Presentation
  const renderPresentation = () => {
    return (
      <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-8 text-center`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mb-3">
          {actionIcons.presentation && (
            <div className="text-white">
              {actionIcons.presentation}
            </div>
          )}
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-2">Presentation Feature</h4>
        <p className="text-sm text-slate-600 mb-4">
          This feature is currently under development
        </p>
        <div className="bg-white/70 rounded-lg p-4 inline-block">
          <pre className="text-xs text-slate-700 text-left">
            {JSON.stringify(resultData, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  // Render Chatbot
  const renderChatbot = () => {
    return (
      <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-8 text-center`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mb-3">
          {actionIcons.chatbot && (
            <div className="text-white">
              {actionIcons.chatbot}
            </div>
          )}
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-2">Chatbot Feature</h4>
        <p className="text-sm text-slate-600">
          Interactive chat is handled in the Chatbot tab
        </p>
      </div>
    )
  }

  // Main render logic
  const renderContent = () => {
    switch (activeAction) {
      case 'summary':
        return renderSummary()
      case 'flashcards':
        return renderFlashcards()
      case 'quiz':
        return renderQuiz()
      case 'presentation':
        return renderPresentation()
      case 'chatbot':
        return renderChatbot()
      default:
        return (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-600 text-sm">Unknown action type</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Result header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center text-white`}>
            {actionIcons[activeAction]}
          </div>
          <div>
            <h3 className={`text-lg font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
              {actionNames[activeAction]}
            </h3>
            <p className="text-xs text-slate-500">Generated result</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Generate Another
        </button>
      </div>

      {/* Result content */}
      {renderContent()}
    </div>
  )
}

export default ResultRenderer
