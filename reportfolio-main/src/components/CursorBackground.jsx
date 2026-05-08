import { useEffect, useRef } from 'react'

export default function CursorBackground() {
  const blobRef = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      if (blobRef.current) {
        blobRef.current.style.left = e.clientX + 'px'
        blobRef.current.style.top  = e.clientY + 'px'
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div ref={blobRef} className="cursor-bg-blob" />
  )
}
