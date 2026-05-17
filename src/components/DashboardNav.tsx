"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Dumbbell, Footprints, User } from 'lucide-react'
import { useTheme } from "@/context/ThemeContext"
import { useLanguage } from "@/context/LanguageContext"

const navItems = [
  {
    id: "schedule",
    label: "Schedule",
    href: "/schedule",
    icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    id: "workout",
    label: "Workout",
    href: "/workout",
    icon: <Dumbbell size={20} />,
  },
  {
    id: "report",
    label: "Report",
    href: "/report",
    icon: <BarChart3 size={20} />,
  },
  {
    id: "hike",
    label: "Hike",
    href: "/hike",
    icon: <Footprints size={20} />,
  },
  {
    id: "settings",
    label: "Profile",
    href: "/settings",
    icon: <User size={20} />,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const lockedVisibleUntil = useRef(0)
  const ticking = useRef(false)
  const { theme } = useTheme()
  const { t } = useLanguage()
  const hideNav = pathname.startsWith("/exercise")
  const currentIndex = navItems.findIndex((item) => pathname.startsWith(item.href))
  const [travelIndex, setTravelIndex] = useState(Math.max(currentIndex, 0))
  const activeIndex = currentIndex >= 0 ? travelIndex : -1
  const navThemeClass = theme === "dark"
    ? "border-[rgba(255,255,255,0.08)] bg-[rgba(19,23,22,0.74)] shadow-[0_18px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.05)]"
    : "border-[rgba(17,24,22,0.09)] bg-[rgba(255,255,255,0.76)] shadow-[0_18px_44px_rgba(22,32,30,0.12),inset_0_1px_0_rgba(255,255,255,0.75)]"

  useEffect(() => {
    if (currentIndex >= 0) setTravelIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    if (hideNav) {
      setVisible(false)
      return
    }

    const scrollEls = Array.from(document.querySelectorAll<HTMLElement>("[data-dashboard-scroll], main"))
      .filter((el, index, list) => list.indexOf(el) === index)

    const els = scrollEls.length ? scrollEls : [document.documentElement]

    const getScrollY = (target?: HTMLElement | null) => {
      if (target) return target.scrollTop
      return Math.max(window.scrollY, ...els.map((el) => el.scrollTop))
    }

    setVisible(true)
    lastScrollY.current = getScrollY()
    ticking.current = false

    const updateFromY = (currentScrollY: number) => {
      if (Date.now() < lockedVisibleUntil.current) {
        setVisible(true)
        lastScrollY.current = currentScrollY
        return
      }

      const delta = currentScrollY - lastScrollY.current

      if (currentScrollY <= 10) {
        setVisible(true)
      } else if (delta > 18) {
        setVisible(false)
      } else if (delta < -10) {
        setVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    const handleScroll = (event?: Event) => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const target = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
          updateFromY(getScrollY(target))
          ticking.current = false
        })
        ticking.current = true
      }
    }

    els.forEach((el) => el.addEventListener("scroll", handleScroll, { passive: true }))
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      els.forEach((el) => el.removeEventListener("scroll", handleScroll))
      window.removeEventListener("scroll", handleScroll)
    }
  }, [pathname, hideNav])

  if (hideNav) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          key="bottom-nav"
          initial={{ y: 76, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 76, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-[70] flex items-center justify-center px-3.5"
        >
          <div className={`dashboard-nav-shell pointer-events-auto relative grid w-full max-w-[460px] grid-cols-5 items-center overflow-hidden rounded-[28px] border p-1.5 backdrop-blur-[22px] ${navThemeClass}`}>
            {activeIndex >= 0 && (
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ x: `${activeIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.78 }}
                className="pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 w-[calc((100%-12px)/5)] rounded-[20px] border border-[rgba(107,191,184,0.25)] bg-[linear-gradient(180deg,rgba(107,191,184,0.2),rgba(107,191,184,0.08))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_28px_rgba(107,191,184,0.12)]"
              />
            )}
            {navItems.map((item, index) => {
              const isActive = index === activeIndex
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    lockedVisibleUntil.current = Date.now() + 700
                    setVisible(true)
                    setTravelIndex(index)
                    router.push(item.href)
                  }}
                  whileTap={{ scale: 0.96 }}
                  animate={{ y: isActive ? -1 : 0 }}
                  className={`relative z-[1] flex min-h-[54px] min-w-0 cursor-pointer flex-col items-center justify-center gap-[3px] overflow-hidden rounded-[22px] border-0 bg-transparent px-2 py-[7px] ${
                    isActive ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  <motion.span
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    className={`relative flex ${isActive ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]"}`}
                  >
                    {item.icon}
                  </motion.span>
                  <span className={`relative font-[var(--font-display)] text-[10px] font-extrabold leading-none tracking-normal ${isActive ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                    {(t[item.id as keyof typeof t] as string) || item.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
