import React, { useState } from 'react'

function InputSelector({ onSubmit, loading }) {
  const [activeTab, setActiveTab] = useState('files')
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const tabs = [
    {
      id: 'text',
      label: 'Text / Topic',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      accent: '#1E3A8A',
      activeBg: '#EEF2FF',
    },
    {
      id: 'webpage',
      label: 'Webpage / YouTube',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      accent: '#1E3A8A',
      activeBg: '#EEF2FF',
    },
    {
      id: 'files',
      label: 'Upload File',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      accent: '#1E3A8A',
      activeBg: '#EEF2FF',
    },
  ]

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return
    
    // Reset inputs when switching tabs
    setTextInput('')
    setUrlInput('')
    setSelectedFile(null)
    setActiveTab(tabId)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/x-msvideo',
      'video/quicktime',
      'video/x-matroska',
      'video/x-flv',
      'video/x-ms-wmv'
    ]
    
    const validExtensions = ['.pdf', '.doc', '.docx', '.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
      setSelectedFile(file)
    } else {
      alert('Please upload a PDF, Word (.doc/.docx), or Video file (.mp4/.avi/.mov/.mkv/.flv/.wmv)')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const isValidInput = () => {
    if (activeTab === 'text') return textInput.trim().length > 0
    if (activeTab === 'webpage') return urlInput.trim().length > 0
    if (activeTab === 'files') return selectedFile !== null
    return false
  }

  const handleSubmit = async () => {
    if (!isValidInput() || loading) return

    const formData = new FormData()

    if (activeTab === 'text') {
      formData.append('text', textInput)
    } else if (activeTab === 'webpage') {
      formData.append('youtube_url', urlInput)
    } else if (activeTab === 'files') {
      formData.append('file', selectedFile)
    }

    await onSubmit(formData)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F3F4F6] p-1 rounded-[8px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2 px-4 rounded-[6px] text-sm font-medium transition-all flex items-center justify-center gap-1.5 border ${
                isActive
                  ? 'bg-white shadow-sm'
                  : 'border-transparent text-[#6B7280] hover:text-[#374151] hover:bg-white'
              }`}
              style={isActive ? {
                borderColor: tab.accent,
                color: tab.accent,
                backgroundColor: tab.activeBg,
              } : {}}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Input Areas */}
      <div
        className="bg-white rounded-[8px] overflow-hidden"
        style={{ border: `1px solid #E5E7EB`, borderTop: `3px solid ${tabs.find(t => t.id === activeTab)?.accent || '#E5E7EB'}` }}
      >
        <div className="p-6">
        {/* Text / Topic Input */}
        {activeTab === 'text' && (
          <div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter a topic or paste your text here…"
              rows={8}
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] resize-none text-[#111827] placeholder-[#9CA3AF] transition-colors"
            />
            <p className="text-sm text-[#6B7280] mt-3">
              Enter a topic name or paste text content.
            </p>
          </div>
        )}

        {/* Webpage Input */}
        {activeTab === 'webpage' && (
          <div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste a YouTube or webpage URL"
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-[#111827] placeholder-[#9CA3AF] transition-colors"
            />
            <p className="text-sm text-[#6B7280] mt-3 font-medium">
              Paste a YouTube or webpage URL. Content will be extracted automatically.
            </p>
          </div>
        )}

        {/* Files Input */}
        {activeTab === 'files' && (
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[8px] p-12 text-center transition-colors ${
                dragActive
                  ? 'border-[#1E3A8A] bg-[#EEF2FF]'
                  : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-[#EEF2FF] rounded-[8px] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-[#111827]">{selectedFile.name}</p>
                  <p className="text-sm text-[#6B7280] font-medium">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-[#EEF2FF] rounded-[8px] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#111827] font-semibold mb-1">
                      Drag and drop a file, or browse
                    </p>
                    <p className="text-sm text-[#6B7280] mb-4">or</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.mkv,.flv,.wmv"
                        className="hidden"
                      />
                      <span className="cursor-pointer bg-[#1E3A8A] hover:bg-[#1C337A] text-white px-4 py-2 rounded-[8px] font-medium transition-colors inline-block text-sm">
                        Browse Files
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-[#6B7280] mt-3">
              Supported formats: PDF, Word (.doc/.docx), Video (.mp4 .avi .mov .mkv .flv .wmv)
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isValidInput() || loading}
          className="w-full mt-4 h-10 bg-[#1E3A8A] text-white px-4 rounded-[8px] font-medium hover:bg-[#1C337A] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Process Content'
          )}
        </button>
        </div>
      </div>
    </div>
  )
}

export default InputSelector
