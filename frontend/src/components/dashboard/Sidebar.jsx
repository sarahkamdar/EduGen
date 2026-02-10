import React, { useState } from 'react'

function Sidebar({ history, activeContentId, onNewSession, onSelectContent, onLogout, loading, onClose, onDeleteContent, onRefreshHistory }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

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

  const getInputTypeColor = (inputType) => {
    switch (inputType) {
      case 'pdf':
        return 'bg-red-500'
      case 'word':
        return 'bg-blue-500'
      case 'video':
        return 'bg-purple-500'
      case 'youtube':
        return 'bg-red-600'
      case 'text':
        return 'bg-green-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getInputTypeIcon = (inputType) => {
    switch (inputType) {
      case 'pdf':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'word':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'youtube':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'text':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const handleDeleteContent = async (contentId, event) => {
    event.stopPropagation() // Prevent triggering onSelectContent

    if (!confirm('Are you sure you want to delete this content session? This will delete all related summaries, flashcards, and quizzes. This action cannot be undone.')) {
      return
    }

    if (onDeleteContent) {
      onDeleteContent(contentId)
    }
  }

  const handleStartEdit = (contentId, currentTitle, event) => {
    event.stopPropagation()
    setEditingId(contentId)
    setEditTitle(currentTitle)
  }

  const handleSaveEdit = async (contentId, event) => {
    event?.stopPropagation()
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/content/${contentId}/rename`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: editTitle.trim() })
      })

      if (response.ok) {
        // Refresh history if callback provided
        if (onRefreshHistory) {
          onRefreshHistory()
        }
      }
    } catch (error) {
      console.error('Failed to rename:', error)
    }
    
    setEditingId(null)
  }

  const handleCancelEdit = (event) => {
    event?.stopPropagation()
    setEditingId(null)
    setEditTitle('')
  }

  return (
    <aside className="w-80 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-r-2 border-blue-200 flex flex-col h-screen shadow-xl overflow-hidden">
      {/* Logo */}
      <div className="p-4">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">EduGen</h1>
          <p className="text-[10px] text-slate-600 mt-0.5 font-medium">AI Educational Platform</p>
        </div>
      </div>

      {/* New Session Button */}
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-1.5 shadow-lg text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Session</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
          History
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 rounded-lg p-2 animate-pulse">
                <div className="h-3 bg-blue-200 rounded w-3/4 mb-1.5"></div>
                <div className="h-2 bg-blue-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-600 text-xs font-medium">No history yet</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Start a new session</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.content_id}
                className={`flex items-stretch rounded-lg transition-all border-2 overflow-hidden ${
                  activeContentId === item.content_id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400 shadow-lg'
                    : 'bg-white/70 border-blue-200 hover:bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => onSelectContent(item.content_id)}
                  className="flex-1 text-left p-2.5 min-w-0"
                >
                  <div className="flex items-start gap-2">
                    <div className={`${getInputTypeColor(item.input_type)} p-1.5 rounded-md text-white flex-shrink-0 shadow-md`}>
                      {getInputTypeIcon(item.input_type)}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      {editingId === item.content_id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={(e) => handleSaveEdit(item.content_id, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(item.content_id, e)
                            if (e.key === 'Escape') handleCancelEdit(e)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-xs font-semibold bg-white text-slate-800 px-2 py-1 rounded border-2 border-blue-400 focus:outline-none focus:border-blue-600"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-start gap-1 min-w-0">
                          <p className={`text-sm font-semibold break-words flex-1 min-w-0 ${
                            activeContentId === item.content_id ? 'text-white' : 'text-slate-800'
                          }`}>
                            {item.title || `${item.input_type.charAt(0).toUpperCase() + item.input_type.slice(1)} Content`}
                          </p>
                          <button
                            onClick={(e) => handleStartEdit(item.content_id, item.title, e)}
                            className={`flex-shrink-0 p-0.5 rounded transition-colors ${
                              activeContentId === item.content_id
                                ? 'text-white/70 hover:text-white hover:bg-white/20'
                                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Rename"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <p
                        className={`text-xs mt-1 line-clamp-2 break-words ${
                          activeContentId === item.content_id ? 'text-blue-100' : 'text-slate-600'
                        }`}
                      >
                        {item.preview}
                      </p>
                      <p
                        className={`text-[10px] mt-1.5 font-medium ${
                          activeContentId === item.content_id ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
                
                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteContent(item.content_id, e)}
                  className={`flex-shrink-0 w-10 flex items-center justify-center transition-colors border-l-2 ${
                    activeContentId === item.content_id
                      ? 'text-white/70 hover:text-white hover:bg-red-500 border-blue-400'
                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50 border-blue-200'
                  }`}
                  title="Delete content"
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

      {/* Logout Button */}
      <div className="p-3 border-t-2 border-blue-200">
        <button
          onClick={onLogout}
          className="w-full bg-white border-2 border-red-200 text-red-600 py-2 px-3 rounded-lg font-semibold hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-1.5 text-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
