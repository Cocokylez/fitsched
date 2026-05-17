"use client"

import { FitSchedLoader } from "@/components/LoadingScreen"

export default function Loading() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--bg)] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(107,191,184,0.13),transparent_34%)]" />
      <div className="relative">
        <FitSchedLoader />
      </div>
    </div>
  )
}
