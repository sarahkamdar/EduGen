import React from 'react'

function JobStatusCard({ job, onView, onDismiss, onRetry }) {
  if (!job || job.hidden) return null

  const isComplete = job.status === 'complete'
  const isFailed = job.status === 'failed'
  const progress = typeof job.progress === 'number' ? job.progress : 0

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-80 rounded-[16px] border bg-white p-4 shadow-2xl ${isComplete ? 'border-[#BBF7D0]' : isFailed ? 'border-[#FECACA]' : 'border-[#C7D2FE]'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isComplete ? 'bg-[#DCFCE7] text-[#16A34A]' : isFailed ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#EEF2FF] text-[#1E3A8A]'}`}>
            {isComplete ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : isFailed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111827] truncate">
              {isComplete ? 'Content Ready' : isFailed ? 'Processing Failed' : 'Processing Content'}
            </p>
            <p className="text-xs text-[#6B7280] truncate">
              {job.title || job.message || 'Working in the background'}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-md p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]"
          aria-label="Dismiss job card"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!isComplete && !isFailed && (
        <>
          <p className="text-xs text-[#6B7280] mb-2">{job.message || 'Queued for processing...'}</p>
          <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1E3A8A] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">In progress</span>
            <span className="font-semibold text-[#1E3A8A]">{progress}%</span>
          </div>
        </>
      )}

      {isComplete && (
        <button
          onClick={() => onView(job.contentId)}
          className="mt-2 w-full rounded-[10px] bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15803D] transition-colors"
        >
          View Content →
        </button>
      )}

      {isFailed && (
        <div className="space-y-2">
          <p className="text-xs text-[#B91C1C]">{job.message || 'Processing failed.'}</p>
          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 rounded-[10px] bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1C337A] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onDismiss}
              className="rounded-[10px] border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobStatusCard