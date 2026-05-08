import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'Home',     href: '#hero'     },
  { label: 'About',    href: '#about'    },
  { label: 'Skills',   href: '#skills'   },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact',  href: '#contact'  },
]

export default function Navbar() {
  const [visible,  setVisible]  = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState('hero')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setVisible(y > 60)
      setScrolled(y > 120)
      const sections = document.querySelectorAll('section[id]')
      let current = 'hero'
      sections.forEach(s => { if (y >= s.offsetTop - 90) current = s.id })
      setActiveId(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => {
    const target = document.querySelector(href)
    if (!target) return
    window.scrollTo({ top: target.offsetTop - 64, behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: -80, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          className={`fixed top-0 left-0 right-0 z-[1000] nav-glass ${scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : ''}`}
        >
          <div className="max-w-[1100px] mx-auto px-8 h-[60px] flex items-center justify-between">
            <span className="nav-brand cursor-default" onClick={() => scrollTo('#hero')}>AKC</span>

            <ul className="hidden md:flex gap-0.5">
              {NAV_ITEMS.map(({ label, href }) => (
                <li key={href}>
                  <button onClick={() => scrollTo(href)} className={`nav-link ${activeId === href.slice(1) ? 'active' : ''}`}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              className={`hamburger md:hidden flex flex-col gap-[5px] bg-transparent border-none p-1 ${menuOpen ? 'open' : ''}`}
            >
              <span /><span /><span />
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden flex flex-col px-6 pb-4 pt-2 gap-0.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                {NAV_ITEMS.map(({ label, href }) => (
                  <button key={href} onClick={() => scrollTo(href)} className="mobile-link text-left">{label}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
