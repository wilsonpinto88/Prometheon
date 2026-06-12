import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../shared/store/chatStore'
import ChatMessage from './ChatMessage'

export default function ChatPanel() {
  const {
    isOpen,
    closeChat,
    messages,
    isStreaming,
    error,
    setError,
    sendMessage,
    newConversation,
  } = useChatStore()

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex flex-col w-80 h-[520px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
      role="dialog"
      aria-label="AI Study Assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-lg">⚡</span>
          <span className="text-white font-semibold text-sm">Study Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newConversation}
            className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            title="New conversation"
          >
            New
          </button>
          <button
            onClick={closeChat}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-xs text-center mt-8">
            Ask me anything about your current study material.
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            streaming={msg.streaming}
          />
        ))}
        {error && (
          <div
            role="alert"
            className="text-red-400 text-xs bg-red-900/30 rounded-lg px-3 py-2 mt-2 flex justify-between items-start"
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-white"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your study assistant..."
            rows={2}
            disabled={isStreaming}
            className="flex-1 bg-gray-700 text-white text-sm rounded-xl px-3 py-2 resize-none outline-none placeholder-gray-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
            aria-label="Message input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="self-end bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
