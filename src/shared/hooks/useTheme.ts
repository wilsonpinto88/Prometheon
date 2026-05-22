import { useEffect } from 'react'
import useLocalStorage from './useLocalStorage'

type Theme = 'dark' | 'light'

function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('prometheon-theme', 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light-mode')
    } else {
      root.classList.remove('light-mode')
    }
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return { theme, toggleTheme }
}

export default useTheme
