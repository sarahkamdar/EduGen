import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import InputSelector from './InputSelector'
import ProcessingStatus from './ProcessingStatus'
import ActionSelector from './ActionSelector'
import ResultRenderer from './ResultRenderer'
import OutputHistory from './OutputHistory'

/**
 * EDUGEN STATE MANAGEMENT
 * 
 * Strict Single-Action Flow:
 * - Only ONE action can be active at any time
 * - Switching actions clears previous config and result
 * - Results are displayed for the active action only
 * 
 * State Structure:
 * 
 * 1. AUTH
 *    - token (localStorage)
 *    - user info
 * 
 * 2. CONTENT
 *    - contentId: Current active content session
 *    - inputType: text | pdf | audio | video | youtube
 *    - normalizedTextStatus: ready | processing | failed
 * 
 * 3. UI
 *    - activeAction: summary | flashcards | quiz | presentation | chatbot | null
 *    - isProcessing: Boolean for loading states
 *    - sidebarOpen: Boolean for sidebar visibility
 * 
 * 4. RESULTS (Single-action storage)
 *    - activeResult: Stores ONLY the current action's result
 *    - activeAction: Tracks which action generated this result
 * 
 * 5. ERRORS
 *    - uploadError: Content upload errors
 *    - generateError: Action generation errors
 * 
 * 6. HISTORY
 *    - pastSessions: Array of previous content sessions
 * 
 * Data Flow:
 * 
 * Upload Flow:
 *   User uploads → isProcessing=true → backend call → contentId saved → isProcessing=false
 * 
 * Action Flow:
 *   User selects action → activeAction set → config UI shown → 
 *   User clicks generate → isProcessing=true → backend call → 
 *   activeResult saved → ResultRenderer shows result
 * 
 * Switch Action Flow:
 *   User switches to new action → activeAction updated → 
 *   Previous result cleared → New config UI shown
 * 
 * Reset Flow:
 *   New session → All states cleared
 *   Select history item → Load contentId, clear results
 */

function DashboardLayout() {
  // ==================== AUTH STATE ====================
  // Token is managed in localStorage
  // Retrieved on each API call via localStorage.getItem('token')

  // ==================== CONTENT STATE ====================
  const [content, setContent] = useState({
    contentId: null,
    inputType: null,
    normalizedTextStatus: null
  })

  // ==================== UI STATE ====================
  const [ui, setUi] = useState({
    activeAction: null,        // 'summary' | 'flashcards' | 'quiz' | 'presentation' | 'chatbot' | null
    isProcessing: false,       // Upload or generation in progress
    sidebarOpen: true,         // Sidebar visibility
    processingStage: 'upload', // Current processing stage
    processingMessage: 'Processing...', // Current status message
    processingPercentage: 0,   // Progress percentage (0-100)
    processingInputType: null  // Type of content being processed
  })

  // ==================== RESULTS STATE ====================
  // Single result storage - only ONE action's result at a time
  const [result, setResult] = useState({
    data: null,                // Result data from backend
    action: null               // Which action generated this result
  })

  // ==================== ERRORS STATE ====================
  const [errors, setErrors] = useState({
    uploadError: '',
    generateError: ''
  })

  // ==================== HISTORY STATE ====================
  const [history, setHistory] = useState({
    pastSessions: [],
    loading: true
  })
  const [outputHistoryRefreshKey, setOutputHistoryRefreshKey] = useState(0)

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    fetchHistory()
  }, [])

  // ==================== API CALLS ====================

  /**
   * Fetch user's content history from backend
   */
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/content/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
          return
        }
        throw new Error('Failed to fetch history')
      }

      const data = await response.json()
      setHistory({ pastSessions: data.history || [], loading: false })
    } catch (error) {
      console.error('Error fetching history:', error)
      setHistory(prev => ({ ...prev, loading: false }))
    }
  }

  /**
   * Upload new content with real-time progress updates
   */
  const handleUpload = async (formData) => {
    // Determine input type for progress display
    let inputType = 'file'
    if (formData.has('youtube_url')) {
      inputType = 'youtube'
    } else if (formData.has('text')) {
      inputType = 'text'
    } else if (formData.has('file')) {
      const file = formData.get('file')
      const ext = file.name?.split('.').pop()?.toLowerCase()
      if (['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv'].includes(ext)) {
        inputType = 'video'
      } else if (ext === 'pdf') {
        inputType = 'pdf'
      } else if (['doc', 'docx'].includes(ext)) {
        inputType = 'word'
      }
    }

    // Start processing
    setUi(prev => ({ 
      ...prev, 
      isProcessing: true, 
      processingStage: 'start',
      processingMessage: 'Starting...',
      processingPercentage: 0,
      processingInputType: inputType
    }))
    setErrors({ uploadError: '', generateError: '' })

    try {
      const token = localStorage.getItem('token')
      
      // Use SSE streaming endpoint for all uploads (real-time progress)
      const response = await fetch('/content/upload-stream', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
          if (response.status === 401) {
            handleUnauthorized()
            return
          }
          const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }))
          throw new Error(errorData.detail || 'Upload failed')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let contentId = null
        let inputType = null

        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                // Update UI with real-time progress
                // Skip percentage update if -1 (keepalive signal)
                setUi(prev => ({
                  ...prev,
                  processingStage: data.stage,
                  processingMessage: data.message,
                  processingPercentage: data.percentage >= 0 ? data.percentage : prev.processingPercentage
                }))

                // Handle completion
                if (data.stage === 'complete') {
                  contentId = data.content_id
                  inputType = data.input_type
                }

                // Handle error
                if (data.stage === 'error') {
                  throw new Error(data.message)
                }
              } catch (e) {
                if (e.message && e.message !== 'Unexpected end of JSON input') {
                  throw e
                }
              }
            }
          }
        }

        if (contentId) {
          // Save content data
          setContent({
            contentId: contentId,
            inputType: inputType || 'unknown',
            normalizedTextStatus: 'ready'
          })

          // Refresh history
          await fetchHistory()
        } else {
          throw new Error('Upload completed but no content ID received')
        }
    } catch (error) {
      setErrors(prev => ({ ...prev, uploadError: error.message }))
    } finally {
      setUi(prev => ({ 
        ...prev, 
        isProcessing: false, 
        processingStage: 'upload',
        processingMessage: 'Processing...',
        processingPercentage: 0,
        processingInputType: null
      }))
    }
  }

  /**
   * Generate action output (summary, flashcards, quiz, etc.)
   * Special handling for presentation downloads
   */
  const handleGenerate = async (action, formData) => {
    // CRITICAL: Clear previous result when generating new action
    setResult({ data: null, action: null })
    setErrors({ uploadError: '', generateError: '' })
    
    // Set active action and start processing
    setUi(prev => ({ ...prev, activeAction: action, isProcessing: true }))

    try {
      const token = localStorage.getItem('token')
      const endpoint = `/content/${action}`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
          return
        }
        const data = await response.json().catch(() => ({ detail: 'Generation failed' }))
        throw new Error(data.detail || 'Generation failed')
      }

      // All actions now return JSON (including PPT)
      const data = await response.json()
      
      // Save result for ONLY this action
      setResult({
        data: data,
        action: action
      })

      // Update history after successful generation
      await fetchHistory()
      
      // Force OutputHistory to refresh
      setOutputHistoryRefreshKey(prev => prev + 1)
    } catch (error) {
      setErrors(prev => ({ ...prev, generateError: error.message }))
      // Clear active action on error
      setUi(prev => ({ ...prev, activeAction: null }))
    } finally {
      setUi(prev => ({ ...prev, isProcessing: false }))
    }
  }

  // ==================== UI HANDLERS ====================

  /**
   * Start a new content session
   * Clears all active states
   */
  const handleNewSession = () => {
    setContent({
      contentId: null,
      inputType: null,
      normalizedTextStatus: null
    })
    setUi({
      activeAction: null,
      isProcessing: false,
      sidebarOpen: ui.sidebarOpen, // Preserve sidebar state
      processingStep: 0
    })
    setResult({
      data: null,
      action: null
    })
    setErrors({
      uploadError: '',
      generateError: ''
    })
  }

  /**
   * Select content from history
   * Loads content but clears all results
   */
  const handleSelectContent = (contentId) => {
    console.log('[Dashboard] Switching to content:', contentId)
    setContent(prev => ({
      ...prev,
      contentId: contentId,
      normalizedTextStatus: 'ready'
    }))
    // Clear UI state and results when switching content
    setUi(prev => ({
      ...prev,
      activeAction: null, // Always clear active action when switching content
      isProcessing: false
    }))
    setResult({
      data: null,
      action: null
    })
    setErrors({
      uploadError: '',
      generateError: ''
    })
    // Reset output history refresh key for new content
    setOutputHistoryRefreshKey(0)
  }

  /**
   * Close current result and return to action selection
   * CRITICAL: This allows user to generate another action
   */
  const handleCloseResult = () => {
    setResult({
      data: null,
      action: null
    })
    setUi(prev => ({
      ...prev,
      activeAction: null
    }))
    setErrors(prev => ({
      ...prev,
      generateError: ''
    }))
  }

  /**
   * Handle unauthorized access
   */
  const handleUnauthorized = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  /**
   * Logout user
   */
  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  /**
   * Load a previous generated output from history
   */
  const handleSelectHistoryOutput = async (outputId, feature) => {
    try {
      console.log('[Dashboard] Loading output:', outputId, 'Feature:', feature)
      const token = localStorage.getItem('token')
      const response = await fetch(`/content/output/${outputId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
          return
        }
        throw new Error('Failed to fetch output')
      }

      const data = await response.json()

      // Special handling for chatbot - force reload by clearing first
      if (feature === 'chatbot') {
        // First clear to force unmount/remount of ChatbotUI
        setUi(prev => ({
          ...prev,
          activeAction: null
        }))
        setResult({
          data: null,
          action: null
        })
        
        // Then set after a brief delay to trigger reload
        setTimeout(() => {
          setUi(prev => ({
            ...prev,
            activeAction: 'chatbot'
          }))
          setResult({
            data: data,
            action: 'chatbot'
          })
        }, 50)
        return
      }

      // Normalize the data structure for historical outputs
      // Historical data comes wrapped in { output: { ... } }
      // Fresh data comes directly as { quiz: [...], summary: "...", etc. }
      let normalizedData = { ...data }
      
      if (data.output) {
        // Unwrap the output field and merge with top-level data
        normalizedData = {
          ...data,
          ...data.output,
          output_id: data.output_id,
          content_id: data.content_id,
          feature: data.feature,
          options: data.options
        }
        
        // For quiz, ensure mode is preserved from options
        if (feature === 'quiz' && data.options && data.options.mode) {
          normalizedData.mode = data.options.mode
        }
      }

      // Set the result and activate the corresponding action
      setResult({
        data: normalizedData,
        action: feature
      })
      setUi(prev => ({
        ...prev,
        activeAction: feature
      }))
    } catch (error) {
      setErrors(prev => ({ ...prev, generateError: error.message }))
    }
  }

  /**
   * Delete a content session and all related data
   */
  const handleDeleteContent = async (contentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
          return
        }
        throw new Error('Failed to delete content')
      }

      // If we're deleting the currently active content, clear all states
      if (content.contentId === contentId) {
        handleNewSession()
      }

      // Refresh history to remove deleted content
      await fetchHistory()
    } catch (error) {
      alert(`Failed to delete content: ${error.message}`)
    }
  }

  // ==================== RENDER ====================

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      {ui.sidebarOpen && (
        <Sidebar
          history={history.pastSessions}
          activeContentId={content.contentId}
          onNewSession={handleNewSession}
          onSelectContent={handleSelectContent}
          onLogout={handleLogout}
          loading={history.loading}
          onClose={() => setUi(prev => ({ ...prev, sidebarOpen: false }))}
          onDeleteContent={handleDeleteContent}
          onRefreshHistory={fetchHistory}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {content.contentId ? 'Content Session' : 'EduGen Dashboard'}
          </h2>
        </div>

        <div className="max-w-5xl mx-auto p-6">
          {/* Content Session Active */}
          {content.contentId ? (
            <div className="space-y-6">
              {/* Output History */}
              <OutputHistory 
                key={`history-${content.contentId}-${outputHistoryRefreshKey}`}
                contentId={content.contentId}
                onSelectOutput={handleSelectHistoryOutput}
              />

              {/* Error Display */}
              {errors.generateError && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs font-medium">
                  {errors.generateError}
                </div>
              )}

              {/* Action Configuration (shown when NO result exists OR when chatbot is active) */}
              {(!result.data || ui.activeAction === 'chatbot') && (
                <ActionSelector 
                  key={`action-${content.contentId}`}
                  contentId={content.contentId} 
                  onGenerate={handleGenerate}
                  isProcessing={ui.isProcessing}
                  chatbotHistory={ui.activeAction === 'chatbot' && result.action === 'chatbot' ? result.data : null}
                />
              )}

              {/* Results Display (shown when result exists, but NOT for chatbot) */}
              {result.data && result.action && result.action !== 'chatbot' && (
                <ResultRenderer 
                  activeAction={result.action}
                  resultData={result.data}
                  onClose={handleCloseResult}
                />
              )}
            </div>
          ) : ui.isProcessing ? (
            /* Upload Processing */
            <ProcessingStatus 
              stage={ui.processingStage}
              message={ui.processingMessage}
              percentage={ui.processingPercentage}
              inputType={ui.processingInputType}
            />
          ) : (
            /* Initial Upload Screen */
            <div className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Start a New Session
                </h2>
                <p className="text-slate-600 text-base">
                  Upload content to generate summaries, flashcards, quizzes, and more.
                </p>
              </div>

              {errors.uploadError && (
                <div className="max-w-3xl mx-auto mb-4">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs font-medium">
                    {errors.uploadError}
                  </div>
                </div>
              )}

              <InputSelector onSubmit={handleUpload} loading={ui.isProcessing} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
