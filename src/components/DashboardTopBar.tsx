"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

type DashboardTopBarProps = {
  title: React.ReactNode
  children?: React.ReactNode
}

/**
 * Renders the compact dashboard top bar shared by primary app pages.
 *
 * @param props - Page title and optional right-side controls.
 * @returns A polished dashboard top bar.
 */
export function DashboardTopBar({ title, children }: DashboardTopBarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-topbar">
      <div className="brand-wordmark truncate text-[15px] font-black leading-none text-[var(--text)]">
        {title}
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">
        {children}
        <button
          type="button"
          onClick={toggleTheme}
          className="icon-button"
          aria-label="Toggle dark and light mode"
        >
          {theme === "dark" ? <Sun size={16} strokeWidth={1.9} /> : <Moon size={16} strokeWidth={1.9} />}
        </button>
      </div>
    </div>
  )
}
