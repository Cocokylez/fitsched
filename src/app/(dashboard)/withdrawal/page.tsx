"use client"

import { useRouter } from "next/navigation"

export default function WithdrawalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 pb-8 pt-6">
      <div className="mx-auto max-w-[520px]">
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="mb-[18px] cursor-pointer rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-[9px] text-[13px] font-bold text-[var(--text)]"
        >
          Back to Profile
        </button>

        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-[22px] py-7 text-center">
          <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[rgba(107,191,184,0.38)] bg-[rgba(107,191,184,0.12)] text-[17px] font-black text-[#6bbfb8]">
            FT
          </div>
          <div className="mb-2 text-[26px] font-black text-[var(--text)]">
            Coming soon
          </div>
          <div className="text-sm leading-normal text-[var(--text-muted)]">
            FitToken withdrawals are not available yet. Your balance stays visible while the reward system is being prepared.
          </div>
        </div>
      </div>
    </div>
  )
}
