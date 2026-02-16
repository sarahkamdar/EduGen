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
      <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Processing Content
          </h3>
          <p className="text-slate-600 text-sm">{message}</p>
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
                      ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${status === 'active' ? 'bg-blue-500 border-blue-500 text-white animate-pulse' : ''}
                      ${status === 'pending' ? 'bg-slate-100 border-slate-300 text-slate-400' : ''}
                      ${status === 'error' ? 'bg-red-500 border-red-500 text-white' : ''}
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
                      status === 'completed' ? 'text-green-600' : 
                      status === 'active' ? 'text-blue-600' : 
                      status === 'error' ? 'text-red-600' : 'text-slate-400'
                    }`}>
                      {s.name}
                    </p>
                  </div>
                  
                  {/* Connector Line */}
                  {!isLast && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                      getStageStatus(allStages[index + 1].key, index + 1) === 'completed' || status === 'completed' && getStageStatus(allStages[index + 1].key, index + 1) !== 'pending'
                        ? 'bg-green-500' 
                        : status === 'active' ? 'bg-gradient-to-r from-blue-500 to-slate-200' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs font-semibold text-blue-600">{percentage}%</span>
          </div>
        </div>

        {/* Current Stage Info */}
        {stage !== 'complete' && stage !== 'error' && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-700">
                {allStages.find(s => s.key === stage)?.description || 'Processing...'}
              </p>
            </div>
          </div>
        )}

        {stage === 'complete' && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700 font-medium">Content processed successfully!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProcessingStatus
