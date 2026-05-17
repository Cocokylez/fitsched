"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Globe, Moon, Sun } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useTheme } from "@/context/ThemeContext"

const languages = [
  { code: "EN", label: "English" },
  { code: "CN", label: "中文" },
  { code: "JP", label: "日本語" },
  { code: "VI", label: "Tiếng Việt" },
]

/**
 * Renders floating language and theme controls.
 *
 * @returns Global floating controls.
 */
export function GlobalControls() {
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const { language, changeLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="fixed right-4 top-4 z-[9999] flex items-center gap-2">
      <div ref={langRef} className="relative">
        <button
          type="button"
          onClick={() => setLangOpen(!langOpen)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] shadow-[var(--shadow)]"
          aria-label="Choose language"
        >
          <Globe size={16} />
        </button>

        <AnimatePresence>
          {langOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-[9999] flex min-w-[132px] flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-[var(--shadow-lg)]"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    changeLanguage(lang.code as "EN" | "CN" | "JP" | "VI")
                    setLangOpen(false)
                  }}
                  className={`w-full cursor-pointer rounded-[12px] border-0 px-3 py-2 text-left text-xs ${
                    language === lang.code
                      ? "bg-[var(--accent-soft)] font-bold text-[var(--accent-strong)]"
                      : "bg-transparent font-normal text-[var(--text-muted)]"
                  }`}
                >
                  {lang.code} {lang.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] shadow-[var(--shadow)]"
        aria-label="Toggle dark and light mode"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  )
}
