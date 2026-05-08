import { useRef, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function TiltCard({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const [glowing, setGlowing] = useState(false)
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  const rotateX = useSpring(0, { stiffness: 150, damping: 20 })
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top)  / height
    rotateX.set((0.5 - y) * 14)
    rotateY.set((x - 0.5) * 14)
    setGlow({ x: x * 100, y: y * 100 })
  }

  const handleMouseEnter = () => setGlowing(true)

  const handleMouseLeave = () => {
    setGlowing(false)
    rotateX.set(0)
    rotateY.set(0)
    setGlow({ x: 50, y: 50 })
  }

  return (
    <div style={{ perspective: '900px' }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          position: 'relative',
          boxShadow: glowing
            ? '0 0 0 1px rgba(255,255,255,0.13), 0 8px 40px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.03)'
            : '0 8px 32px rgba(0,0,0,0.4)',
          transition: 'box-shadow 0.35s ease',
          ...style,
        }}
        className={className}
      >
        {/* Cursor spotlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: glowing ? 1 : 0,
            transition: 'opacity 0.3s ease',
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
          }}
        />
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
