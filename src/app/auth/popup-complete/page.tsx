"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function AuthPopupCompletePage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get("next") || "/schedule"

    if (window.opener) {
      const timer = window.setTimeout(() => {
        window.opener.postMessage(
          { type: "fitsched:google-auth-complete", next },
          window.location.origin
        )
        window.close()
      }, 250)

      return () => window.clearTimeout(timer)
    } else {
      window.location.replace(next)
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[var(--bg)] p-6 text-center text-[var(--text)]">
      <div className="text-xl font-extrabold">FitSched</div>
      <div className="text-[13px] text-[var(--text-muted)]">
        Finishing Google sign in...
      </div>
    </div>
  )
}
