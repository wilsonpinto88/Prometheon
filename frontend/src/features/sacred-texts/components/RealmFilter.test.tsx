import { render, screen, fireEvent } from '@testing-library/react'
import RealmFilter from './RealmFilter'

describe('RealmFilter', () => {
  test('renders all realm buttons', () => {
    render(<RealmFilter selectedRealm={null} onRealmChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'All Realms' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tartarus' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Asgard' })).toBeInTheDocument()
  })

  test('All Realms has aria-pressed=true when no realm selected', () => {
    render(<RealmFilter selectedRealm={null} onRealmChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'All Realms' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('selected realm button has aria-pressed=true', () => {
    render(<RealmFilter selectedRealm="tartarus" onRealmChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Tartarus' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All Realms' })).toHaveAttribute('aria-pressed', 'false')
  })

  test('calls onRealmChange with realm id on click', () => {
    const onRealmChange = vi.fn()
    render(<RealmFilter selectedRealm={null} onRealmChange={onRealmChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Tartarus' }))
    expect(onRealmChange).toHaveBeenCalledWith('tartarus')
  })

  test('calls onRealmChange with null when All Realms clicked', () => {
    const onRealmChange = vi.fn()
    render(<RealmFilter selectedRealm="tartarus" onRealmChange={onRealmChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'All Realms' }))
    expect(onRealmChange).toHaveBeenCalledWith(null)
  })

  test('filter group has accessible label', () => {
    render(<RealmFilter selectedRealm={null} onRealmChange={() => {}} />)
    expect(screen.getByRole('group', { name: 'Filter by realm' })).toBeInTheDocument()
  })
})
