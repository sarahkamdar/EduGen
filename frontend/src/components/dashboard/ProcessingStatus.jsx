import React from 'react'

function ProcessingStatus({ stage = 'upload', message = 'Processing...', percentage = 0, inputType = 'file' }) {
  // Define stages based on input type
  const getStagesForInput = (type) => {
    if (type === 'youtube' || type === 'video') {
      return [
        { key: 'start', name: 'Initialize', description: 'Setting up processing pipeline' },
        { key: 'upload', name: 'Connect', description: 'Connecting to source' },
        { key: 'extract', name: 'Download', description: 'Downloading media content' },
        { key: 'transcribe', name: 'Transcribe', description: 'Converting audio to text' },
        { key: 'finalize', name: 'Finalize', description: 'Preparing content' }
      ]
    } else if (type === 'pdf' || type === 'word') {
      return [
        { key: 'start', name: 'Initialize', description: 'Setting up processing pipeline' },
        { key: 'upload', name: 'Upload', description: 'Uploading file to server' },
        { key: 'extract', name: 'Extract', description: 'Extracting text from document' },
        { key: 'finalize', name: 'Finalize', description: 'Preparing content' }
      ]
    } else {
      return [
        { key: 'start', name: 'Initialize', description: 'Setting up processing pipeline' },
        { key: 'upload', name: 'Upload', description: 'Uploading content' },
        { key: 'extract', name: 'Process', description: 'Processing content' },
        { key: 'finalize', name: 'Finalize', description: 'Preparing content' }
      ]
    }
  }

  const allStages = getStagesForInput(inputType)
  
  // Find current stage index
  const currentIndex = allStages.findIndex(s => s.key === stage)
  
  // Determine stage status
  const getStageStatus = (stageKey, index) => {
    if (stage === 'complete') return 'completed'
    if (stage === 'error') return index <= currentIndex ? 'error' : 'pending'
    if (index < currentIndex) return 'completed'
    if (index === currentIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-base font-semibold text-[#111827] mb-1">
            Processing Content
          </h3>
          <p className="text-[#6B7280] text-sm">{message}</p>
        </div>

        {/* Stages Timeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {allStages.map((s, index) => {
              const status = getStageStatus(s.key, index)
              const isLast = index === allStages.length - 1
              
              return (
                <React.Fragment key={s.key}>
                  {/* Stage Node */}
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${status === 'completed' ? 'bg-[#22C55E] border-[#22C55E] text-white' : ''}
                      ${status === 'active' ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white' : ''}
                      ${status === 'pending' ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF]' : ''}
                      ${status === 'error' ? 'bg-[#EF4444] border-[#EF4444] text-white' : ''}
                    `}>
                      {status === 'completed' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : status === 'active' ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : status === 'error' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <p className={`mt-2 text-xs font-medium text-center ${
                      status === 'completed' ? 'text-[#22C55E]' : 
                      status === 'active' ? 'text-[#1E3A8A]' : 
                      status === 'error' ? 'text-[#EF4444]' : 'text-[#9CA3AF]'
                    }`}>
                      {s.name}
                    </p>
                  </div>
                  
                  {/* Connector Line */}
                  {!isLast && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                      getStageStatus(allStages[index + 1].key, index + 1) === 'completed' || status === 'completed' && getStageStatus(allStages[index + 1].key, index + 1) !== 'pending'
                        ? 'bg-[#22C55E]' 
                        : status === 'active' ? 'bg-[#E5E7EB]' : 'bg-[#E5E7EB]'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1E3A8A] transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#6B7280]">Progress</span>
            <span className="text-xs font-medium text-[#1E3A8A]">{percentage}%</span>
          </div>
        </div>

        {/* Current Stage Info */}
        {stage !== 'complete' && stage !== 'error' && (
          <div className="bg-[#EEF2FF] rounded-[8px] p-3 border border-[#C7D2FE]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1E3A8A] rounded-full"></div>
              <p className="text-sm text-[#1E3A8A]">
                {allStages.find(s => s.key === stage)?.description || 'Processing...'}
              </p>
            </div>
          </div>
        )}

        {stage === 'complete' && (
          <div className="bg-[#F0FDF4] rounded-[8px] p-3 border border-[#BBF7D0]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-[#166534] font-medium">Content processed successfully.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProcessingStatus
