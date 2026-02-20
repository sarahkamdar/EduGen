import React, { useState, useEffect } from 'react'
import PPTPreview from './PPTPreview'

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
    ppt: 'Presentation',
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
    ppt: (
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
                <li key={idx} className="text-[#374151] text-sm leading-relaxed list-disc">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          )
        } else if (currentListType === 'numbered') {
          elements.push(
            <ol key={`list-${elements.length}`} className="ml-6 mb-4 space-y-1.5">
              {listItems.map((item, idx) => (
                <li key={idx} className="text-[#374151] text-sm leading-relaxed list-decimal">
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
          parts.push(<strong key={key++} className="font-bold text-[#111827]">{boldMatch[1]}</strong>)
          remaining = remaining.slice(boldMatch[0].length)
          continue
        }

        // Italic (*text*)
        const italicMatch = remaining.match(/\*([^*]+?)\*/)
        if (italicMatch && italicMatch.index === 0) {
          parts.push(<em key={key++} className="italic text-[#374151]">{italicMatch[1]}</em>)
          remaining = remaining.slice(italicMatch[0].length)
          continue
        }

        // Code (`code`)
        const codeMatch = remaining.match(/`([^`]+?)`/)
        if (codeMatch && codeMatch.index === 0) {
          parts.push(
            <code key={key++} className="px-1.5 py-0.5 bg-[#E5E7EB] text-[#1F2937] rounded text-xs font-mono">
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
          <h3 key={index} className="text-lg font-bold text-[#111827] mb-3 mt-4">
            {parseInlineFormatting(line.replace(/^###\s*/, ''))}
          </h3>
        )
      }
      // Headers (##)
      else if (line.startsWith('##')) {
        flushList()
        elements.push(
          <h2 key={index} className="text-xl font-bold text-[#111827] mb-3 mt-5">
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
          <p key={index} className="text-[#374151] text-sm leading-relaxed mb-3">
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

    const summaryTypeLabel = {
      detailed: 'Detailed Notes',
      brief: 'Brief Overview',
      exam: 'Exam-Focused',
      bullets: 'Quick Bullets',
    }[summaryType] || 'Summary'

    const wordCount = summary.split(/\s+/).filter(Boolean).length

    return (
      <div className="space-y-4">
        {/* Dark navy header */}
        <div
          className="rounded-[12px] overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)',
            backgroundSize: '22px 22px, cover',
            boxShadow: '0 4px 24px rgba(30,58,138,0.18)',
          }}
        >
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-[10px] bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">Summary</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-blue-200 border border-white/20">
                  {summaryTypeLabel}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Words</p>
                <p className="text-xl font-bold text-white">{wordCount}</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Type</p>
                <p className="text-sm font-semibold text-white capitalize">{summaryType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content card */}
        <div className="rounded-[12px] overflow-hidden border border-[#C7D2FE]" style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.07)' }}>
          <div className="px-6 py-6 bg-white">
            <div
              className="text-[15px] text-[#374151] leading-[1.8] space-y-3
                [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-[#1E1B4B] [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:pl-3 [&_h1]:border-l-4 [&_h1]:border-[#1E3A8A] [&_h1]:bg-[#EEF2FF] [&_h1]:py-1 [&_h1]:rounded-r-[6px]
                [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-[#1E3A8A] [&_h2]:mt-5 [&_h2]:mb-1.5 [&_h2]:pl-3 [&_h2]:border-l-4 [&_h2]:border-[#A5B4FC] [&_h2]:bg-[#EEF2FF] [&_h2]:py-0.5 [&_h2]:rounded-r-[6px]
                [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[#374151] [&_h3]:mt-4 [&_h3]:mb-1
                [&_p]:leading-[1.8] [&_p]:text-[#374151]
                [&_ul]:ml-5 [&_ul]:space-y-1.5
                [&_ol]:ml-5 [&_ol]:space-y-1.5
                [&_li]:text-sm [&_li]:leading-[1.7] [&_li]:text-[#374151]
                [&_strong]:font-semibold [&_strong]:text-[#1E1B4B]
                [&_em]:italic [&_em]:text-[#6B7280]"
            >
              {formatText(summary)}
            </div>
          </div>
        </div>

        {/* Generate New */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 border-2 border-[#C7D2FE] text-[#1E3A8A] bg-[#EEF2FF] rounded-[10px] text-sm font-semibold hover:bg-[#E0E7FF] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate New
        </button>
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
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 text-center">
          <p className="text-sm text-[#6B7280] mb-2">No flashcards generated.</p>
          {resultData.flashcards?.raw_response && (
            <div className="mt-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[8px] p-3">
              <p className="text-xs text-[#1E3A8A] font-medium mb-0.5">Generation Error</p>
              <p className="text-xs text-[#78350F]">The AI returned invalid JSON. Try generating again.</p>
            </div>
          )}
          <details className="mt-4">
            <summary className="text-xs text-[#9CA3AF] cursor-pointer hover:text-[#6B7280]">Show debug info</summary>
            <pre className="mt-2 text-[10px] text-left bg-[#F9FAFB] border border-[#E5E7EB] p-2 rounded-[6px] max-h-40 overflow-auto">
              {JSON.stringify(resultData, null, 2)}
            </pre>
          </details>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Dark navy header */}
        <div
          className="rounded-[12px] overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)',
            backgroundSize: '22px 22px, cover',
            boxShadow: '0 4px 24px rgba(30,58,138,0.18)',
          }}
        >
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-[10px] bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">Flashcards</h3>
                <div className="flex items-center flex-wrap gap-1.5">
                  {resultData.options?.flashcard_type && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-blue-200 border border-white/20 capitalize">
                      {resultData.options.flashcard_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Cards</p>
                <p className="text-xl font-bold text-white">{flashcards.length}</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Progress</p>
                <p className="text-xl font-bold text-white">{currentCard + 1} / {flashcards.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {/* Progress indicator */}
          <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-[#6B7280]">
            {currentCard + 1} / {flashcards.length} cards
          </span>
          <div className="flex gap-1">
            {flashcards.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentCard(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentCard
                    ? 'w-6 bg-[#1E3A8A]'
                    : idx < currentCard
                    ? 'w-3 bg-[#A5B4FC]'
                    : 'w-3 bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Flashcard */}
        <div
          className="relative rounded-[12px] min-h-[300px] cursor-pointer select-none transition-all duration-300 bg-[#EEF2FF] border border-[#A5B4FC]"
          style={{ boxShadow: '0 4px 24px rgba(99, 102, 241, 0.10)' }}
          onClick={() => toggleFlip(currentCard)}
        >
          {/* Side label badge */}
          <div className="absolute top-4 left-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-[#1E3A8A] border border-[#A5B4FC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
              {flippedCards[currentCard] ? 'Answer' : 'Question'}
            </span>
          </div>

          {/* Card number */}
          <div className="absolute top-4 right-5">
            <span className="text-xs font-medium text-[#A5B4FC]">#{currentCard + 1}</span>
          </div>

          {/* Content */}
          <div className="flex items-center justify-center min-h-[300px] px-10 pt-14 pb-12">
            <div className="text-base font-medium text-[#1E1B4B] text-center leading-relaxed max-w-xl">
              {formatText(flippedCards[currentCard]
                ? flashcards[currentCard].back
                : flashcards[currentCard].front
              )}
            </div>
          </div>

          {/* Flip hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <span className="text-xs text-[#A5B4FC]">click to flip</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
            disabled={currentCard === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E5E7EB] text-sm text-[#374151] rounded-[8px] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1))}
            disabled={currentCard === flashcards.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] border border-[#1E3A8A] text-sm text-white rounded-[8px] hover:bg-[#1C337A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        </div>

        {/* Generate New */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 border-2 border-[#C7D2FE] text-[#1E3A8A] bg-[#EEF2FF] rounded-[10px] text-sm font-semibold hover:bg-[#E0E7FF] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate New
        </button>
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
      let errorTitle = 'Generation Error'
      let errorMessage = 'The AI could not generate quiz questions. Please try again.'
      let errorSuggestions = []
      
      if (rawResponse.includes('Empty response')) {
        errorTitle = 'Empty Response'
        errorMessage = 'The AI model returned an empty response.'
        errorSuggestions = [
          'The content might be too long - try uploading a smaller document',
          'The free API tier may have rate limits - wait a moment and retry',
          'Try reducing the number of questions'
        ]
      } else if (rawResponse.includes('content_filter')) {
        errorTitle = 'Content Filtered'
        errorMessage = 'The AI model filtered the content.'
        errorSuggestions = [
          'Your content may contain sensitive information',
          'Try uploading different content'
        ]
      } else if (rawResponse.includes('cut off') || rawResponse.includes('truncated') || rawResponse.includes('incomplete')) {
        errorTitle = 'Response Incomplete'
        errorMessage = 'The AI response was cut off mid-generation.'
        errorSuggestions = [
          'Reduce the number of questions (try 5-7 instead of 10)',
          'Upload a shorter document or text',
          'The free API has token limits that were exceeded'
        ]
      } else if (rawResponse.includes('length')) {
        errorTitle = 'Content Too Long'
        errorMessage = 'The response was truncated due to length.'
        errorSuggestions = [
          'Reduce the number of questions',
          'Upload a shorter document',
          'Try using only the first few pages of your content'
        ]
      } else if (rawResponse.includes('Error:')) {
        errorTitle = 'API Error'
        errorMessage = rawResponse
      } else if (rawResponse.includes('parse') || rawResponse.includes('malformed')) {
        errorTitle = 'Parsing Error'
        errorMessage = 'Failed to process the AI response.'
        errorSuggestions = [
          'Try generating again with fewer questions',
          'The response may have been incomplete',
          'Try with simpler content or shorter text'
        ]
      }
      
      return (
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FEF9C3] rounded-[8px] mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <p className="text-[#111827] text-base font-semibold mb-1">{errorTitle}</p>
          <p className="text-[#6B7280] text-sm mb-4">{errorMessage}</p>
          
          {errorSuggestions.length > 0 && (
            <div className="mt-4 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[8px] p-4 text-left">
              <p className="text-xs font-medium text-[#1E3A8A] mb-2">Suggestions</p>
              <ul className="text-xs text-[#1C337A] space-y-1">
                {errorSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#1E3A8A] mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <details className="mt-4">
            <summary className="text-xs text-[#9CA3AF] cursor-pointer hover:text-[#6B7280] inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Technical details
            </summary>
            <pre className="mt-2 text-[10px] text-left bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-[8px] max-h-40 overflow-auto">
              {JSON.stringify(resultData, null, 2)}
            </pre>
          </details>
          
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 border border-[#E5E7EB] text-[#374151] rounded-[8px] text-sm hover:bg-[#F9FAFB] transition-colors"
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
    const difficulty = resultData.options?.difficulty || 'Medium'

    if (!isTestMode) {
      return (
        <div className="space-y-4">
          {/* Dark navy header */}
          <div
            className="rounded-[12px] overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)',
              backgroundSize: '22px 22px, cover',
              boxShadow: '0 4px 24px rgba(30,58,138,0.18)',
            }}
          >
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-[10px] bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-1">Quiz</h3>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-blue-200 border border-white/20">
                      Practice Mode
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-blue-200 border border-white/20 capitalize">
                      {difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                  <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Questions</p>
                  <p className="text-xl font-bold text-white">{quiz.length}</p>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                  <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Difficulty</p>
                  <p className="text-sm font-semibold text-white capitalize">{difficulty}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Questions with answers shown */}
          <div className="space-y-4">
            {quiz.map((question, qIndex) => (
              <div
                key={question.id}
                className="bg-white border border-[#E5E7EB] rounded-[8px] p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-[6px] flex items-center justify-center text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
                    {qIndex + 1}
                  </div>
                  <div className="flex-1 text-sm font-semibold text-[#111827] leading-relaxed">
                    {formatText(question.question)}
                  </div>
                </div>

                <div className="space-y-2">
                  {Object.entries(question.options).map(([key, value]) => {
                    const isCorrectOption = question.correct_answer === key
                    
                    return (
                      <div
                        key={key}
                        className={`w-full text-left px-4 py-2.5 rounded-[8px] border text-sm ${
                          isCorrectOption
                            ? 'border-[#BBF7D0] bg-[#F0FDF4]'
                            : 'border-[#E5E7EB] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${
                            isCorrectOption
                              ? 'border-[#16A34A] bg-[#16A34A] text-white'
                              : 'border-[#D1D5DB] text-[#6B7280]'
                          }`}>
                            {key}
                          </span>
                          <div className="text-[#374151] flex-1">
                            {formatText(value)}
                          </div>
                          {isCorrectOption && (
                            <span className="flex-shrink-0 text-[#16A34A] text-xs">Correct</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Show explanation if available */}
                {question.explanation && question.explanation.trim() !== '' && (
                  <div className="mt-3 p-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[8px]">
                    <p className="text-xs font-medium text-[#1E3A8A] mb-1">Explanation</p>
                    <div className="text-xs text-[#1C337A]">
                      {formatText(question.explanation)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Generate New */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border-2 border-[#C7D2FE] text-[#1E3A8A] bg-[#EEF2FF] rounded-[10px] text-sm font-semibold hover:bg-[#E0E7FF] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate New
          </button>
        </div>
      )
    }

    // Test Mode: Interactive quiz with user selection and evaluation
    return (
      <div className="space-y-4">
        {/* Dark navy header */}
        <div
          className="rounded-[12px] overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)',
            backgroundSize: '22px 22px, cover',
            boxShadow: '0 4px 24px rgba(30,58,138,0.18)',
          }}
        >
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-[10px] bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">Quiz</h3>
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-blue-200 border border-white/20">
                    Test Mode
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-blue-200 border border-white/20 capitalize">
                    {difficulty}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Questions</p>
                <p className="text-xl font-bold text-white">{quiz.length}</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Difficulty</p>
                <p className="text-sm font-semibold text-white capitalize">{difficulty}</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-[8px] p-3">
                <p className="text-[10px] text-blue-300 font-medium mb-0.5 uppercase tracking-wide">Score</p>
                <p className="text-sm font-semibold text-white">{showResults ? `${score.percentage}%` : '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score display */}
        {showResults && (
          <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 text-center">
            <div className={`text-5xl font-bold mb-2 ${
              score.percentage >= 80 ? 'text-[#16A34A]' :
              score.percentage >= 60 ? 'text-[#D97706]' :
              'text-[#DC2626]'
            }`}>
              {score.percentage}%
            </div>
            <p className="text-sm font-medium text-[#111827] mb-1">Test Completed</p>
            <p className="text-sm text-[#6B7280]">
              {score.correct} of {score.total} correct
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Grade: {score.percentage >= 90 ? 'A' : score.percentage >= 80 ? 'B' : score.percentage >= 70 ? 'C' : score.percentage >= 60 ? 'D' : 'F'}
            </p>
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
                className={`bg-white border ${
                  showResults
                    ? isCorrect
                      ? 'border-[#BBF7D0]'
                      : 'border-[#FECACA]'
                    : 'border-[#E5E7EB]'
                } rounded-[8px] p-5`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-[6px] flex items-center justify-center text-xs font-medium ${
                    showResults
                      ? isCorrect
                        ? 'bg-[#F0FDF4] text-[#16A34A]'
                        : 'bg-[#FEF2F2] text-[#DC2626]'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {qIndex + 1}
                  </div>
                  <div className="flex-1 text-sm font-semibold text-[#111827] leading-relaxed">
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
                        className={`w-full text-left px-4 py-2.5 rounded-[8px] border transition-colors text-sm ${
                          showResults
                            ? isCorrectOption
                              ? 'border-[#BBF7D0] bg-[#F0FDF4]'
                              : isSelected
                              ? 'border-[#FECACA] bg-[#FEF2F2]'
                              : 'border-[#E5E7EB] bg-white'
                            : isSelected
                            ? 'border-[#1E3A8A] bg-[#EEF2FF]'
                            : 'border-[#E5E7EB] hover:border-[#D1D5DB] bg-white'
                        } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${
                            showResults
                              ? isCorrectOption
                                ? 'border-[#16A34A] bg-[#16A34A] text-white'
                                : isSelected
                                ? 'border-[#DC2626] bg-[#DC2626] text-white'
                                : 'border-[#D1D5DB] text-[#6B7280]'
                              : isSelected
                              ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                              : 'border-[#D1D5DB] text-[#6B7280]'
                          }`}>
                            {key}
                          </span>
                          <div className="text-[#374151] flex-1">
                            {formatText(value)}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Test mode: Show what was wrong */}
                {showResults && !isCorrect && (
                  <div className="mt-3 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px]">
                    <p className="text-xs font-medium text-[#B91C1C] mb-1">Incorrect</p>
                    <p className="text-xs text-[#DC2626]">
                      Your answer: <span className="font-semibold">{userAnswers[question.id]}</span>
                      {' · '} Correct: <span className="font-semibold">{question.correct_answer}</span>
                    </p>
                    {question.explanation && question.explanation.trim() !== '' && (
                      <div className="mt-2 pt-2 border-t border-[#FECACA]">
                        <p className="text-xs text-[#DC2626]">{formatText(question.explanation)}</p>
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
              <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-[8px] p-3">
                <p className="text-xs font-medium text-[#1E3A8A] mb-0.5">Ready to submit?</p>
                <p className="text-xs text-[#B45309]">You won't be able to change your answers after submission.</p>
              </div>
            )}
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(userAnswers).length !== quiz.length}
              className="w-full px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#1C337A] text-white rounded-[8px] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {Object.keys(userAnswers).length === quiz.length
                ? 'Submit Test'
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
            className="w-full px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#1C337A] text-white rounded-[8px] text-sm font-medium transition-colors"
          >
            Retake Test
          </button>
        )}

        {/* Generate New */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 border-2 border-[#C7D2FE] text-[#1E3A8A] bg-[#EEF2FF] rounded-[10px] text-sm font-semibold hover:bg-[#E0E7FF] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate New
        </button>
      </div>
    )
  }

  // Render Presentation
  const renderPresentation = () => {
    return <PPTPreview resultData={resultData} onClose={onClose} />
  }

  // Render Chatbot
  const renderChatbot = () => {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#EEF2FF] rounded-[8px] mb-3 text-[#1E3A8A]">
          {actionIcons.chatbot}
        </div>
        <h4 className="text-base font-semibold text-[#111827] mb-1">Chatbot</h4>
        <p className="text-sm text-[#6B7280]">
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
      case 'ppt':
        return renderPresentation()
      case 'chatbot':
        return renderChatbot()
      default:
        return (
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-8 text-center">
            <p className="text-[#6B7280] text-sm">Unknown action type</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {renderContent()}
    </div>
  )
}

export default ResultRenderer
