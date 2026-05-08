// Dark mode is now always-on (matte black) — hook kept for compatibility
import { useState, useEffect } from 'react'
export function useDarkMode() {
  const [isDark] = useState(true)
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  }, [])
  return [isDark, () => {}]
}
