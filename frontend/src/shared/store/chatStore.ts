import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface ChatState {
  isOpen: boolean
  conversationId: string | null
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  contextEntityId: string | undefined
  contextEntityType: 'text' | 'task' | undefined

  openChat: (entityId?: string, entityType?: 'text' | 'task') => void
  closeChat: () => void
  setError: (error: string | null) => void
  sendMessage: (content: string) => Promise<void>
  newConversation: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  conversationId: null,
  messages: [],
  isStreaming: false,
  error: null,
  contextEntityId: undefined,
  contextEntityType: undefined,

  openChat: (entityId, entityType) => {
    set({ isOpen: true, contextEntityId: entityId, contextEntityType: entityType })
  },

  closeChat: () => set({ isOpen: false }),

  setError: (error) => set({ error }),

  newConversation: () => set({ conversationId: null, messages: [], error: null }),

  sendMessage: async (content: string) => {
    const { conversationId, contextEntityId, contextEntityType, messages } = get()

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content }
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      streaming: true,
    }

    set({ messages: [...messages, userMsg, assistantMsg], isStreaming: true, error: null })

    const token = localStorage.getItem('auth_token')
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        message: content,
        conversationId: conversationId ?? undefined,
        contextEntityId,
        contextEntityType,
      }),
    })

    if (!res.ok || !res.body) {
      set((s) => ({
        messages: s.messages.slice(0, -1),
        isStreaming: false,
        error: 'Failed to reach AI. Check your API key in Settings.',
      }))
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const raw = line.slice(5).trim()
        try {
          const evt = JSON.parse(raw)

          if (evt.conversationId && !get().conversationId) {
            set({ conversationId: evt.conversationId })
          }

          if (evt.token) {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: m.content + evt.token } : m
              ),
            }))
          }

          if (evt.done) {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, streaming: false } : m
              ),
              isStreaming: false,
            }))
          }

          if (evt.error) {
            const msg =
              evt.error === 'api_key_invalid'
                ? 'Your API key is invalid. Update it in Settings.'
                : 'AI error. Try again.'
            set((s) => ({
              messages: s.messages.slice(0, -1),
              isStreaming: false,
              error: msg,
            }))
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }
  },
}))
