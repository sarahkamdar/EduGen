import React, { useState } from 'react'

function InputSelector({ onSubmit, loading }) {
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const tabs = [
    { id: 'text', label: 'Text / Topic' },
    { id: 'webpage', label: 'Webpage' },
    { id: 'files', label: 'Files' }
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
      <div className="flex gap-2 mb-8 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input Areas */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-xl">
        {/* Text / Topic Input */}
        {activeTab === 'text' && (
          <div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter a topic or paste your text here…"
              rows={8}
              className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900 placeholder-slate-400 transition-all"
            />
            <p className="text-sm text-slate-600 mt-3 font-medium">
              💡 You can enter a topic or paste detailed text.
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
              className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 to-purple-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 placeholder-slate-400 transition-all"
            />
            <p className="text-sm text-slate-600 mt-3 font-medium">
              🌐 We'll extract and process the content automatically.
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
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500 font-medium">
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
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold mb-1">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-slate-500 mb-4">or</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.mkv,.flv,.wmv"
                        className="hidden"
                      />
                      <span className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all inline-block shadow-lg">
                        Browse Files
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-3 font-medium">
              📎 Upload documents or videos for processing. (PDF, Word: .doc/.docx, Video: .mp4/.avi/.mov/.mkv/.flv/.wmv)
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isValidInput() || loading}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600 shadow-lg flex items-center justify-center gap-2"
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
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Process Content
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default InputSelector
