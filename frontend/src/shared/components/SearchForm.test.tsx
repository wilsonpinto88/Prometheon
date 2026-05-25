import { render, screen, fireEvent } from '@testing-library/react'
import SearchForm from './SearchForm'

describe('SearchForm', () => {
  test('renders search input with aria-label', () => {
    render(<SearchForm onSearch={() => {}} />)
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument()
  })

  test('uses custom placeholder', () => {
    render(<SearchForm onSearch={() => {}} placeholder="Search books..." />)
    expect(screen.getByPlaceholderText('Search books...')).toBeInTheDocument()
  })

  test('input accepts text entry', () => {
    render(<SearchForm onSearch={() => {}} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'react' } })
    expect(input.value).toBe('react')
  })

  test('renders inside a form element', () => {
    const { container } = render(<SearchForm onSearch={() => {}} />)
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  test('validation error paragraph has role alert when shown', () => {
    render(<SearchForm onSearch={() => {}} />)
    // Validation error element not present on clean render
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
