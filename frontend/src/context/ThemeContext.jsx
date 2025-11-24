import { createContext, useState, useEffect, useContext } from 'react'

export const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Verificar preferencia guardada o sistema
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  const value = {
    isDark,
    toggleTheme,
    theme: isDark ? 'dark' : 'light',
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
