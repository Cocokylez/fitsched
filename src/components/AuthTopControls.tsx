"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Globe2, Moon, Sun } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useTheme } from "@/context/ThemeContext"

const languages = [
  { id: "EN" as const, label: "English" },
  { id: "CN" as const, label: "中文" },
  { id: "JP" as const, label: "日本語" },
  { id: "VI" as const, label: "Tiếng Việt" },
]

export function AuthTopControls() {
  const { language, changeLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between">
      <div className="pointer-events-auto relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Choose language"
          className="flex h-[38px] min-w-[76px] cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.16)] bg-[#ef4444] text-xs font-extrabold text-white shadow-[0_8px_24px_rgba(239,68,68,0.28)]"
        >
          <Globe2 size={15} strokeWidth={2.2} />
          {language}
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={`transition-transform duration-[180ms] ${open ? "rotate-180" : "rotate-0"}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute left-0 top-[46px] w-[150px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_14px_36px_rgba(0,0,0,0.28)]"
            >
              {languages.map((item) => {
                const active = item.id === language
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      changeLanguage(item.id)
                      setOpen(false)
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-[10px] border-0 px-2.5 py-[9px] text-left text-xs ${
                      active ? "bg-[rgba(239,68,68,0.16)] font-extrabold text-[#ef4444]" : "bg-transparent font-semibold text-[var(--text)]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[11px] ${active ? "text-[#ef4444]" : "text-[var(--text-muted)]"}`}>{item.id}</span>
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark and light mode"
        className="pointer-events-auto flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
      >
        {theme === "dark" ? <Sun size={17} strokeWidth={2.1} /> : <Moon size={17} strokeWidth={2.1} />}
      </button>
    </div>
  )
}
