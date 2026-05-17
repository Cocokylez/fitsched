"use client"

import { useEffect, useRef } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export default function GooglePopupPage() {
  const searchParams = useSearchParams()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const next = searchParams.get("next") || "/schedule"
    const completeUrl = new URL("/auth/popup-complete", window.location.origin)
    completeUrl.searchParams.set("next", next)

    signIn("google", { callbackUrl: completeUrl.toString() })
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[var(--bg)] p-6 text-center text-[var(--text)]">
      <div className="text-xl font-extrabold">FitSched</div>
      <div className="text-[13px] text-[var(--text-muted)]">
        Opening Google sign in...
      </div>
    </div>
  )
}
