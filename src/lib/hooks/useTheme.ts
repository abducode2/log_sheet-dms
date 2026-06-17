'use client'
import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'midnight'

const STORAGE_KEY = 'p216-theme'
const DEFAULT: Theme = 'dark'

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(DEFAULT)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const initial = stored ?? DEFAULT
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  function changeTheme(t: Theme) {
    setTheme(t)
    applyTheme(t)
  }

  return { theme, changeTheme }
}
