import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChatPanel from './ChatPanel'
import { useChatStore } from '../../shared/store/chatStore'

describe('ChatPanel', () => {
  beforeEach(() => {
    useChatStore.setState({
      isOpen: false,
      conversationId: null,
      messages: [],
      isStreaming: false,
      error: null,
      contextEntityId: undefined,
      contextEntityType: undefined,
    })
  })

  it('renders nothing when closed', () => {
    render(<ChatPanel />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when store isOpen is true', () => {
    useChatStore.setState({ isOpen: true })
    render(<ChatPanel />)
    expect(screen.getByRole('dialog', { name: 'AI Study Assistant' })).toBeInTheDocument()
  })

  it('closes when the close button is clicked', () => {
    useChatStore.setState({ isOpen: true })
    render(<ChatPanel />)
    fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useChatStore.getState().isOpen).toBe(false)
  })
})
