import React from 'react'

function ProcessingStatus({ stage = 'upload', message = 'Processing...', percentage = 0 }) {
  const stages = {
    start: { name: 'Initializing', icon: 'upload' },
    upload: { name: 'Uploading', icon: 'upload' },
    extract: { name: 'Extracting', icon: 'extract' },
    transcribe: { name: 'Transcribing', icon: 'transcribe' },
    finalize: { name: 'Finalizing', icon: 'finalize' }
  }

  const currentStage = stages[stage] || stages.upload

  const getIcon = (iconType) => {
    const icons = {
      upload: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      extract: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      transcribe: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      finalize: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return icons[iconType] || icons.upload
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mb-3 animate-pulse">
            {getIcon(currentStage.icon)}
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {currentStage.name}
          </h3>
          <p className="text-slate-700 font-medium text-sm">
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all duration-300 ease-out bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-semibold text-slate-600">Progress</span>
            <span className="text-xs font-bold text-blue-600">{percentage}%</span>
          </div>
        </div>

        {/* Stage Details */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 mb-1">What's happening?</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {stage === 'upload' && 'Your content is being securely uploaded to our servers.'}
                {stage === 'extract' && 'We\'re extracting and processing the content from your file.'}
                {stage === 'transcribe' && 'Converting audio/video to text using AI transcription.'}
                {stage === 'finalize' && 'Almost done! Preparing your content for learning.'}
                {stage === 'start' && 'Setting up the processing pipeline for your content.'}
              </p>
            </div>
          </div>
        </div>

        {/* Spinner animation */}
        <div className="mt-6 flex justify-center">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessingStatus
