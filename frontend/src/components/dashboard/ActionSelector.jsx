import React, { useState } from 'react'
import SummaryConfig from './SummaryConfig'
import FlashcardConfig from './FlashcardConfig'
import QuizConfig from './QuizConfig'
import PPTConfig from './PPTConfig'
import ChatbotUI from './ChatbotUI'

function ActionSelector({ contentId, onGenerate, chatbotHistory }) {
  const [activeTab, setActiveTab] = useState('summary')
  const [generating, setGenerating] = useState(false)

  const tabs = [
    {
      id: 'summary',
      name: 'Summary',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      accent: '#1E3A8A',
      activeBg: '#EEF2FF',
      available: true
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      accent: '#1E3A8A',
      activeBg: '#EEF2FF',
      available: true
    },
    {
      id: 'quiz',
      name: 'Quiz',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      accent: '#1E3A8A',
      activeBg: '#EEF2FF',
      available: true
    },
    {
      id: 'ppt',
      name: 'Presentation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      accent: '#1E3A8A',
      activeBg: '#EEF2FF',
      available: true
    },
    {
      id: 'chatbot',
      name: 'Chatbot',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      accent: '#1E3A8A',
      activeBg: '#EEF2FF',
      available: true
    }
  ]

  const handleGenerate = async (formData) => {
    setGenerating(true)
    try {
      await onGenerate(activeTab, formData)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#111827] mb-1">
          Generate
        </h2>
        <p className="text-[#6B7280] text-sm">
          Select an output type to generate from this content.
        </p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-[8px] overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 min-w-fit py-2 px-3 rounded-[6px] text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
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
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Configuration Forms */}
      {(() => {
        const activeTabData = tabs.find(t => t.id === activeTab)
        return (
          <div
            className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden"
            style={{ borderTop: `3px solid ${activeTabData?.accent || '#E5E7EB'}` }}
          >
            <div className="p-6">
              {activeTab === 'summary' && (
                <SummaryConfig
                  contentId={contentId}
                  onGenerate={handleGenerate}
                  loading={generating}
                />
              )}
              
              {activeTab === 'flashcards' && (
                <FlashcardConfig
                  contentId={contentId}
                  onGenerate={handleGenerate}
                  loading={generating}
                />
              )}
              
              {activeTab === 'quiz' && (
                <QuizConfig
                  contentId={contentId}
                  onGenerate={handleGenerate}
                  loading={generating}
                />
              )}

              {activeTab === 'ppt' && (
                <PPTConfig
                  contentId={contentId}
                  onGenerate={handleGenerate}
                  loading={generating}
                />
              )}

              {activeTab === 'chatbot' && (
                <div className="h-[650px]">
                  <ChatbotUI 
                    key={`chatbot-${contentId}`}
                    contentId={contentId} 
                  />
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default ActionSelector
