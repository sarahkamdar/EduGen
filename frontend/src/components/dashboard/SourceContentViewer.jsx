import React, { useState, useEffect } from 'react'

function SourceContentViewer({ contentId, isOpen, onClose }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && contentId) {
      fetchSourceContent()
    }
  }, [isOpen, contentId])

  const fetchSourceContent = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/content/${contentId}/source`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch source content')
      }

      const data = await response.json()
      setContent(data)
    } catch (err) {
      console.error('[SourceContentViewer] Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getInputTypeLabel = (inputType) => {
    switch (inputType) {
      case 'pdf': return 'PDF Document'
      case 'word': return 'Word Document'
      case 'video': return 'Video Transcript'
      case 'youtube': return 'YouTube Transcript'
      case 'text': return 'Text Input'
      default: return 'Content'
    }
  }

  const getInputTypeIcon = (inputType) => {
    switch (inputType) {
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'word':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'youtube':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'text':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const getInputTypeColor = (inputType) => {
    return 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = async () => {
    if (content?.normalized_text) {
      try {
        await navigator.clipboard.writeText(content.normalized_text)
        alert('Content copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[8px] shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-3">
            {content && (
              <div className={`p-2 rounded-[6px] border ${getInputTypeColor(content.input_type)}`}>
                {getInputTypeIcon(content.input_type)}
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-[#111827]">
                {loading ? 'Loading...' : content?.title || 'Source Content'}
              </h2>
              {content && (
                <p className="text-xs text-[#9CA3AF]">
                  {getInputTypeLabel(content.input_type)} • {formatDate(content.created_at)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {content && (
              <button
                onClick={copyToClipboard}
                className="p-2 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
                title="Copy content"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#1E3A8A] rounded-full animate-spin mb-4" />
              <p className="text-[#9CA3AF] text-sm">Loading source content...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 font-medium mb-2">Failed to load content</p>
              <p className="text-sm text-[#6B7280]">{error}</p>
            </div>
          ) : content ? (
            <div className="space-y-4">
              {/* YouTube URL if available */}
              {content.youtube_url && (
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-[#374151]">YouTube Video</span>
                  </div>
                  <a
                    href={content.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1E3A8A] hover:text-[#1C337A] underline break-all"
                  >
                    {content.youtube_url}
                  </a>
                </div>
              )}

              {/* Content Stats */}
              <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {content.normalized_text.split(/\s+/).length.toLocaleString()} words
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10m-10 5h10" />
                  </svg>
                  {content.normalized_text.length.toLocaleString()} characters
                </span>
              </div>

              {/* Text Content */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-5">
                <h3 className="text-sm font-medium text-[#374151] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {content.input_type === 'youtube' || content.input_type === 'video' 
                    ? 'Transcript' 
                    : 'Extracted Content'}
                </h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-[#374151] leading-relaxed text-sm bg-white p-4 rounded-[8px] border border-[#E5E7EB] max-h-[50vh] overflow-y-auto">
                    {content.normalized_text}
                  </pre>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="h-9 px-4 bg-[#111827] text-white text-sm font-medium rounded-[8px] hover:bg-[#374151] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SourceContentViewer
