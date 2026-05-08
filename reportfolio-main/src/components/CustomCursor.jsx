/* Linux / X11-style crosshair cursor — sharp, functional, no frills */
import { useEffect } from 'react'

const CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <line x1="12" y1="1"  x2="12" y2="9"  stroke="white" stroke-width="1.5" stroke-linecap="square"/>
  <line x1="12" y1="15" x2="12" y2="23" stroke="white" stroke-width="1.5" stroke-linecap="square"/>
  <line x1="1"  y1="12" x2="9"  y2="12" stroke="white" stroke-width="1.5" stroke-linecap="square"/>
  <line x1="15" y1="12" x2="23" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="square"/>
  <rect x="11" y="11" width="2" height="2" fill="white"/>
</svg>`

const CURSOR_URL = `data:image/svg+xml,${encodeURIComponent(CURSOR_SVG)}`

export default function CustomCursor() {
  useEffect(() => {
    document.body.style.cursor = `url("${CURSOR_URL}") 12 12, crosshair`
    return () => { document.body.style.cursor = '' }
  }, [])
  return null
}
