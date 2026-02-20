import React, { useState, useRef, useEffect } from 'react'

function ChatbotUI({ contentId, disabled = false, historicalConversation = null }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const messagesEndRef = useRef(null)
  const loadedContentIdRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch existing conversation for the current content
  const fetchExistingConversation = async (contentId) => {
    if (!contentId) return false
    
    setIsLoadingConversation(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/content/${contentId}/outputs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched outputs:', data)
        const chatbotOutput = data.outputs?.find(output => output.feature === 'chatbot')
        console.log('Chatbot output:', chatbotOutput)
        
        if (chatbotOutput && chatbotOutput.output && chatbotOutput.output.conversation) {
          const conversation = chatbotOutput.output.conversation
          console.log('Loading conversation with', conversation.length, 'messages')
          // Filter out any messages without text (defensive check)
          const validMessages = conversation.filter(msg => 
            msg && msg.sender && msg.text && msg.text.trim()
          )
          const formattedMessages = validMessages.map((msg, index) => ({
            id: index + 1,
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date()
          }))
          console.log('Valid messages loaded:', formattedMessages.length)
          setMessages(formattedMessages)
          return true // Conversation found
        }
      }
      return false // No conversation found
    } catch (err) {
      console.error('Error fetching conversation:', err)
      return false
    } finally {
      setIsLoadingConversation(false)
    }
  }

  // Load conversation when contentId changes
  useEffect(() => {
    if (!contentId) {
      setMessages([])
      loadedContentIdRef.current = null
      return
    }
    
    // Only fetch if this is a different content than what we have loaded
    if (contentId !== loadedContentIdRef.current) {
      console.log('Loading conversation for contentId:', contentId)
      loadedContentIdRef.current = contentId
      setError('')
      
      // Fetch existing conversation
      fetchExistingConversation(contentId).then((found) => {
        console.log('Conversation found:', found)
        // Only show welcome message if no conversation exists
        if (!found) {
          setMessages([
            {
              id: 1,
              sender: 'ai',
              text: "Hi! I'm your AI assistant for this content. Ask me anything about what you've uploaded, and I'll help you understand it better!",
              timestamp: new Date()
            }
          ])
        }
      })
    }
  }, [contentId]) // Only depend on contentId, not loadedContentId

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
          <div key={index} className="bg-[#F3F4F6] px-2 py-1 rounded text-xs font-mono my-1">
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
    if (!inputMessage.trim() || disabled || isTyping || isLoadingConversation) return

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
      
      // Prepare chat history - include ALL messages except the welcome message
      const chatHistory = updatedMessages
        .filter(msg => !(msg.id === 1 && msg.sender === 'ai' && msg.text.startsWith("Hi! I'm your AI assistant")))
        .slice(0, -1) // Exclude current message
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
      <div className="h-full flex items-center justify-center p-6 bg-[#F9FAFB]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F3F4F6] rounded-[8px] mb-3">
            <svg className="w-6 h-6 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#111827] mb-1">Chatbot unavailable</h3>
          <p className="text-sm text-[#6B7280] mb-2">
            Upload content first to start chatting.
          </p>
          <p className="text-xs text-[#9CA3AF]">
            The chatbot answers questions based on your uploaded material.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#111827]">AI Learning Assistant</h3>
            <p className="text-xs text-[#6B7280]">Ask anything about your content</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F3F4F6] rounded-full">
            <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></div>
            <span className="text-xs text-[#6B7280]">Active</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex-shrink-0 bg-[#F9FAFB] border-b border-[#E5E7EB] p-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-[#9CA3AF] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-[#6B7280] flex-1">
            This chatbot answers questions based on your uploaded content.
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FAFB]">
        {isLoadingConversation ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F3F4F6] rounded-[8px] mb-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">Loading conversation...</p>
              <p className="text-xs text-[#9CA3AF]">Fetching your chat history</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F3F4F6] rounded-[8px] mb-3">
                <svg className="w-6 h-6 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">Start a conversation</p>
              <p className="text-xs text-[#9CA3AF]">Ask questions about your uploaded content</p>
            </div>
          </div>
        ) : (
          <>
            {messages.filter(msg => msg.text && msg.text.trim()).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-white border border-[#E5E7EB] text-[#111827]'
                  } rounded-[8px] px-4 py-2.5`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-[#6B7280]">AI Assistant</span>
                    </div>
                  )}
                  <div className="text-sm">
                    {message.sender === 'ai' ? formatMessage(message.text) : message.text}
                  </div>
                  <p
                    className={`text-[10px] mt-2 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-[#6B7280]">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-[#E5E7EB] bg-white p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoadingConversation ? "Loading conversation..." : "Ask a question about your content..."}
              rows="1"
              disabled={isLoadingConversation}
              className="w-full px-4 py-3 pr-12 text-sm bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="absolute right-3 bottom-3 text-xs text-[#9CA3AF]">
              {inputMessage.length}/500
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoadingConversation}
            className="flex-shrink-0 w-10 h-10 bg-[#1E3A8A] text-white rounded-[8px] hover:bg-[#1C337A] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-[#6B7280] mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default ChatbotUI
