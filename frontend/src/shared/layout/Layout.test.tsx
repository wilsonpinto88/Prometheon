import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import Providers from '../../app/providers'
import { useChatStore } from '../store/chatStore'

const renderLayout = () =>
  render(
    <BrowserRouter>
      <Providers>
        <Layout>
          <div>content</div>
        </Layout>
      </Providers>
    </BrowserRouter>
  )

describe('Layout chat launcher', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', 'test-token')
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: '1', name: 'Tester', email: 't@t.dev' })
    )
    useChatStore.setState({ isOpen: false })
  })

  it('toggles the chat panel open and closed', () => {
    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: 'Open AI study assistant' }))
    expect(screen.getByRole('dialog', { name: 'AI Study Assistant' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close AI study assistant' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
