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
    processingStep: 0          // Upload progress (0-3)
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
   * Upload new content (text, file, YouTube URL)
   */
  const handleUpload = async (formData) => {
    // Start processing
    setUi(prev => ({ ...prev, isProcessing: true, processingStep: 0 }))
    setErrors({ uploadError: '', generateError: '' })

    try {
      // Simulate processing steps for UX
      const steps = [
        { step: 0, delay: 500 },   // Uploading
        { step: 1, delay: 1000 },  // Extracting
        { step: 2, delay: 1500 },  // Transcribing
        { step: 3, delay: 500 }    // Finalizing
      ]

      for (const { step, delay } of steps) {
        setUi(prev => ({ ...prev, processingStep: step }))
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Call backend
      const token = localStorage.getItem('token')
      const response = await fetch('/content/upload', {
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
        const data = await response.json()
        throw new Error(data.detail || 'Upload failed')
      }

      const data = await response.json()
      
      // Save content data
      setContent({
        contentId: data.content_id,
        inputType: data.input_type || 'unknown',
        normalizedTextStatus: 'ready'
      })

      // Refresh history
      await fetchHistory()
    } catch (error) {
      setErrors(prev => ({ ...prev, uploadError: error.message }))
    } finally {
      setUi(prev => ({ ...prev, isProcessing: false, processingStep: 0 }))
    }
  }

  /**
   * Generate action output (summary, flashcards, quiz, etc.)
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
        const data = await response.json()
        throw new Error(data.detail || 'Generation failed')
      }

      const data = await response.json()
      
      // Save result for ONLY this action
      setResult({
        data: data,
        action: action
      })

      // Update history after successful generation
      await fetchHistory()
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
    setContent(prev => ({
      ...prev,
      contentId: contentId,
      normalizedTextStatus: 'ready'
    }))
    setUi(prev => ({
      ...prev,
      activeAction: prev.activeAction === 'chatbot' ? 'chatbot' : null,
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

      // Special handling for chatbot - load conversation in ChatbotUI
      if (feature === 'chatbot') {
        setUi(prev => ({
          ...prev,
          activeAction: 'chatbot'
        }))
        setResult({
          data: data,
          action: 'chatbot'
        })
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
            <ProcessingStatus currentStep={ui.processingStep} />
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
