import React, { useState } from 'react'
import SourceContentViewer from './SourceContentViewer'
import Logo from '../common/Logo'

function Sidebar({ history, activeContentId, onNewSession, onSelectContent, loading, onClose, onDeleteContent, onRefreshHistory }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [viewingContentId, setViewingContentId] = useState(null)

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
    return 'bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE]'
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

          if (!confirm('Delete this session? All associated outputs (summaries, flashcards, quizzes) will also be removed. This cannot be undone.')) {
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
    <aside className="w-80 flex flex-col h-screen overflow-hidden border-r border-[#C7D2FE]" style={{ backgroundImage: 'radial-gradient(circle, #C7D2FE 1px, transparent 1px)', backgroundSize: '22px 22px', backgroundColor: '#EEF2FF' }}>
      {/* Logo */}
      <div
        className="p-4"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)',
          backgroundSize: '22px 22px, cover',
        }}
      >
        <Logo size="md" variant="light" />
      </div>

      {/* New Session Button */}
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full h-9 bg-[#1E3A8A] text-white px-3 rounded-[8px] font-medium hover:bg-[#1C337A] transition-colors flex items-center justify-center gap-1.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Session</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
          History
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[8px] p-2 animate-pulse border border-[#C7D2FE]">
                <div className="h-3 bg-[#C7D2FE] rounded w-3/4 mb-1.5"></div>
                <div className="h-2 bg-[#C7D2FE] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[#6B7280] text-xs font-medium">No sessions yet</p>
            <p className="text-[#6B7280] text-[10px] mt-0.5">Upload content to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.content_id}
                className={`flex items-stretch rounded-[8px] transition-colors border overflow-hidden ${
                  activeContentId === item.content_id
                    ? 'bg-[#EEF2FF] border-[#1E3A8A]'
                    : 'bg-white border-[#C7D2FE] hover:bg-[#F5F7FF] hover:border-[#A5B4FC]'
                }`}
              >
                <button
                  onClick={() => onSelectContent(item.content_id)}
                  className="flex-1 text-left p-2.5 min-w-0"
                >
                  <div className="flex items-start gap-2">
                    <div className={`${getInputTypeColor(item.input_type)} p-1.5 rounded-[6px] flex-shrink-0`}>
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
                          className="w-full text-xs font-semibold bg-white text-[#111827] px-2 py-1 rounded-[6px] border border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-start gap-1 min-w-0">
                          <p className={`text-sm font-semibold break-words flex-1 min-w-0 ${
                            activeContentId === item.content_id ? 'text-[#111827]' : 'text-[#111827]'
                          }`}>
                            {item.title || `${item.input_type.charAt(0).toUpperCase() + item.input_type.slice(1)} Content`}
                          </p>
                          <button
                            onClick={(e) => handleStartEdit(item.content_id, item.title, e)}
                            className={`flex-shrink-0 p-0.5 rounded transition-colors ${
                              activeContentId === item.content_id
                                ? 'text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6]'
                                : 'text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6]'
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
                        className={`text-xs mt-1 line-clamp-2 break-words text-[#6B7280]`}
                      >
                        {item.preview}
                      </p>
                      <p
                        className={`text-[10px] mt-1.5 font-medium text-[#9CA3AF]`}
                      >
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
                
                {/* Action buttons */}
                <div className="flex flex-col">
                  {/* View source button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setViewingContentId(item.content_id)
                    }}
                    className={`flex-1 w-9 flex items-center justify-center transition-colors text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6]`}
                    title="View source content"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteContent(item.content_id, e)}
                    className={`flex-1 w-9 flex items-center justify-center transition-colors text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2]`}
                    title="Delete content"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source Content Viewer Modal */}
      <SourceContentViewer
        contentId={viewingContentId}
        isOpen={!!viewingContentId}
        onClose={() => setViewingContentId(null)}
      />
    </aside>
  )
}

export default Sidebar
