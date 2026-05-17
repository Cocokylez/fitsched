"use client"

import { FitSchedLoader } from "@/components/LoadingScreen"

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)] p-6">
      <FitSchedLoader />
    </div>
  )
}
