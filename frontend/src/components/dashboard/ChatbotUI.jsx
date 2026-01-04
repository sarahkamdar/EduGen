import React, { useState, useRef, useEffect } from 'react'

function ChatbotUI({ contentId, disabled = false, historicalConversation = null }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load historical conversation when provided
  useEffect(() => {
    if (historicalConversation && historicalConversation.output && historicalConversation.output.conversation) {
      const conversation = historicalConversation.output.conversation
      const formattedMessages = conversation.map((msg, index) => ({
        id: index + 1,
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date()
      }))
      setMessages(formattedMessages)
    }
  }, [historicalConversation])

  // Reset messages when contentId changes (but not if loading historical conversation)
  useEffect(() => {
    if (contentId && !historicalConversation) {
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: "Hi! I'm your AI assistant for this content. Ask me anything about what you've uploaded, and I'll help you understand it better!",
          timestamp: new Date()
        }
      ])
      setError('')
    }
  }, [contentId, historicalConversation])

  // Format markdown-style text for display
  const formatMessage = (text) => {
    // Remove markdown headers (# symbols at start of lines)
    text = text.replace(/^#{1,6}\s+/gm, '')
    
    // Split by lines
    const lines = text.split('\n')
    
    return lines.map((line, index) => {
      // Skip lines that are just punctuation or special characters
      if (line.trim().match(/^[#*\-_=]+$/)) {
        return null
      }
      
      // Handle bold text **text**
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      
      // Handle bullet points starting with - or •
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const content = line.trim().substring(2)
        return (
          <div key={index} className="flex gap-2 ml-2 mb-1">
            <span className="text-indigo-600 mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>') }} />
          </div>
        )
      }
      
      // Handle numbered lists
      const numberedMatch = line.trim().match(/^(\d+)\.\s+(.+)/)
      if (numberedMatch) {
        return (
          <div key={index} className="flex gap-2 ml-2 mb-1">
            <span className="text-indigo-600 font-semibold">{numberedMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: numberedMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>') }} />
          </div>
        )
      }
      
      // Handle code blocks with backticks
      if (line.trim().startsWith('`') && line.trim().endsWith('`')) {
        const code = line.trim().slice(1, -1)
        return (
          <div key={index} className="bg-slate-100 px-2 py-1 rounded text-xs font-mono my-1">
            {code}
          </div>
        )
      }
      
      // Regular text
      if (line.trim()) {
        return (
          <div key={index} className="mb-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        )
      }
      
      // Empty line
      return <div key={index} className="h-1" />
    }).filter(Boolean) // Remove null entries
  }

  const handleSend = async () => {
    if (!inputMessage.trim() || disabled || isTyping) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage('')
    setIsTyping(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Not authenticated. Please log in again.')
      }
      
      // Prepare chat history (last 10 messages, exclude welcome message)
      const chatHistory = updatedMessages
        .slice(1, -1) // Exclude welcome and current message
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))

      const formData = new FormData()
      formData.append('content_id', contentId)
      formData.append('question', userMessage.text)
      if (chatHistory.length > 0) {
        formData.append('chat_history', JSON.stringify(chatHistory))
      }

      const response = await fetch('/content/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.')
        }
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || 'Failed to get response')
      }

      const data = await response.json()

      const aiMessage = {
        id: updatedMessages.length + 1,
        sender: 'ai',
        text: data.answer,
        timestamp: new Date()
      }

      setMessages([...updatedMessages, aiMessage])
    } catch (err) {
      console.error('Chatbot error:', err)
      setError(err.message)
      const errorMessage = {
        id: updatedMessages.length + 1,
        sender: 'ai',
        text: `Error: ${err.message}`,
        timestamp: new Date(),
        isError: true
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (disabled) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl mb-3">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1.5">Chatbot Not Available</h3>
          <p className="text-sm text-slate-600 mb-2">
            Upload content first to start chatting with your AI assistant.
          </p>
          <p className="text-xs text-slate-500">
            The chatbot will answer questions based on your uploaded materials.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">AI Learning Assistant</h3>
            <p className="text-xs text-white/80">Ask me anything about your content</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200 p-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-slate-700 font-medium flex-1">
            This chatbot answers questions based on your uploaded content. Ask about concepts, definitions, or request explanations.
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-3">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Start a conversation</p>
              <p className="text-xs text-slate-500">Ask questions about your uploaded content</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-800'
                  } rounded-2xl px-4 py-2.5 shadow-md`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600">AI Assistant</span>
                    </div>
                  )}
                  <div className="text-sm">
                    {message.sender === 'ai' ? formatMessage(message.text) : message.text}
                  </div>
                  <p
                    className={`text-[10px] mt-2 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-2.5 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-slate-500">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t-2 border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your content..."
              rows="1"
              className="w-full px-4 py-3 pr-12 text-sm bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="absolute right-3 bottom-3 text-xs text-slate-400">
              {inputMessage.length}/500
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
            title="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default ChatbotUI
