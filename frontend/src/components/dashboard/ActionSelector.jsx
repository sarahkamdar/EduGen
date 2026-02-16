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
      color: 'from-blue-500 to-cyan-500',
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
      color: 'from-purple-500 to-pink-500',
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
      color: 'from-green-500 to-emerald-500',
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
      color: 'from-orange-500 to-red-500',
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
      color: 'from-indigo-500 to-purple-500',
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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
          Select Action
        </h2>
        <p className="text-slate-600 text-sm">
          Generate learning materials from your content
        </p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex gap-2 bg-gradient-to-r from-slate-100 to-slate-200 p-1.5 rounded-xl shadow-inner overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 min-w-fit py-2 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Configuration Forms */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-lg">
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
}

export default ActionSelector
