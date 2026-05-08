import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 1000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-content-center justify-center
      transition-all duration-700 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: '#0a0a0a' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="loader-ring" />
        <p className="text-[0.8rem] font-medium tracking-[0.15em] uppercase" style={{ color: '#333' }}>
          Adrian Kyle
        </p>
      </div>
    </div>
  )
}
