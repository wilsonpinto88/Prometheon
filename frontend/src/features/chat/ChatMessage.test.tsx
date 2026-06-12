import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatMessage from './ChatMessage'

describe('ChatMessage', () => {
  it('renders assistant markdown bold as a strong element', () => {
    render(<ChatMessage role="assistant" content="This is **important** info" />)
    const strong = screen.getByText('important')
    expect(strong.tagName).toBe('STRONG')
  })

  it('renders assistant inline code as a code element', () => {
    render(<ChatMessage role="assistant" content="Use `useMemo` here" />)
    const code = screen.getByText('useMemo')
    expect(code.tagName).toBe('CODE')
  })

  it('renders user content as plain text, not markdown', () => {
    render(<ChatMessage role="user" content="keep **this** literal" />)
    expect(screen.getByText('keep **this** literal')).toBeInTheDocument()
  })

  it('wraps long unbroken strings inside the bubble', () => {
    const { container } = render(
      <ChatMessage role="assistant" content="export MY_SERVICE_API_KEY=your_secret_key_here_very_long_unbroken" />
    )
    const bubble = container.querySelector('.break-words')
    expect(bubble).not.toBeNull()
    expect(bubble?.textContent).toContain('MY_SERVICE_API_KEY')
  })
})
