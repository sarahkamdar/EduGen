import React, { useState, useEffect } from 'react'

function OutputHistory({ contentId, onSelectOutput }) {
  const [outputs, setOutputs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Fetch outputs whenever contentId changes (open or not)
  useEffect(() => {
    if (contentId) {
      fetchOutputs()
    } else {
      setOutputs([])
    }
  }, [contentId])

  const fetchOutputs = async () => {
    if (!contentId) return
    
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      console.log('[OutputHistory] Fetching outputs for content:', contentId)
      const response = await fetch(`/content/${contentId}/outputs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch outputs')
      }

      const data = await response.json()
      console.log('[OutputHistory] Loaded', data.outputs?.length || 0, 'outputs')
      setOutputs(data.outputs || [])
    } catch (err) {
      console.error('[OutputHistory] Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOutput = async (outputId, event) => {
    event.stopPropagation() // Prevent triggering onSelectOutput

    if (!confirm('Are you sure you want to delete this generation? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/content/output/${outputId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete output')
      }

      // Remove from local state
      setOutputs(prev => prev.filter(o => o.output_id !== outputId))
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const featureIcons = {
    summary: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    flashcards: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    quiz: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    chatbot: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    ppt: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    )
  }

  const featureColors = {
    summary: 'bg-blue-100 text-blue-700 border-blue-300',
    flashcards: 'bg-purple-100 text-purple-700 border-purple-300',
    quiz: 'bg-green-100 text-green-700 border-green-300',
    chatbot: 'bg-pink-100 text-pink-700 border-pink-300',
    ppt: 'bg-orange-100 text-orange-700 border-orange-300'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getOptionsDisplay = (feature, options, score) => {
    if (feature === 'summary' && options.summary_type) {
      return options.summary_type.charAt(0).toUpperCase() + options.summary_type.slice(1)
    }
    if (feature === 'flashcards' && options.flashcard_type) {
      return options.flashcard_type
    }
    if (feature === 'chatbot' && options.message_count) {
      return `${options.message_count} messages`
    }
    if (feature === 'ppt') {
      const slideInfo = `${options.slide_count || 10} slides`
      const themeInfo = options.theme ? ` • ${options.theme.charAt(0).toUpperCase()}${options.theme.slice(1)}` : ''
      const imageInfo = options.include_images ? ' • Images' : ''
      return `${slideInfo}${themeInfo}${imageInfo}`
    }
    if (feature === 'quiz') {
      const baseInfo = `${options.number_of_questions || 10} Q • ${options.difficulty || 'Medium'}`
      const modeInfo = options.mode ? ` • ${options.mode}` : ''
      if (score) {
        const scoreColor = score.percentage >= 80 ? '🟢' : score.percentage >= 60 ? '🟡' : '🔴'
        return `${baseInfo}${modeInfo} • ${scoreColor} ${score.percentage}% (${score.correct}/${score.total})`
      }
      return `${baseInfo}${modeInfo}`
    }
    return ''
  }

  if (!contentId) return null

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          {loading && !isOpen ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">Generation History</p>
            <p className="text-xs text-slate-500">
              {outputs.length > 0 ? `${outputs.length} previous generation${outputs.length !== 1 ? 's' : ''}` : 'No previous generations'}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 bg-white border-2 border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-3 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-500 mt-2">Loading history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          ) : outputs.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm font-semibold text-slate-700 mb-1">No History Yet</p>
              <p className="text-xs text-slate-500">Generate some content to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {outputs.map((output) => (
                <div
                  key={output.output_id}
                  className="flex items-start gap-2 px-3 py-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
                >
                  <button
                    onClick={() => onSelectOutput(output.output_id, output.feature)}
                    className="flex-1 flex items-start gap-3 text-left"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${featureColors[output.feature] || 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                      {featureIcons[output.feature]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {output.feature}
                        </p>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {formatDate(output.created_at)}
                        </span>
                      </div>
                      {getOptionsDisplay(output.feature, output.options, output.score) && (
                        <p className="text-xs text-slate-600 truncate">
                          {getOptionsDisplay(output.feature, output.options, output.score)}
                        </p>
                      )}
                      {/* Score badge for quiz */}
                      {output.feature === 'quiz' && output.score && (
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            output.score.percentage >= 80 ? 'bg-green-100 text-green-700' :
                            output.score.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {output.score.percentage >= 80 ? '✓' : output.score.percentage >= 60 ? '◐' : '✗'} {output.score.percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteOutput(output.output_id, e)}
                    className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete generation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OutputHistory
