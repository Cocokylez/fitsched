"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"
import { AuthTopControls } from "@/components/AuthTopControls"
import { AuthGoogleButton } from "@/components/AuthGoogleButton"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      name,
      email,
      password,
      action: "register",
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Email already registered or password too weak")
    } else {
      router.push("/onboarding")
    }
  }

  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden overflow-y-auto bg-[var(--bg)] px-5 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(107,191,184,0.13),transparent_44%)]" />
      <AuthTopControls />

      <main className="relative z-[1] mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[420px] flex-col justify-center">

        {/* A1 Editorial hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="mb-4 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">
            {t.fitSched}
          </div>
          <h1 className="display-text mb-2.5 text-[38px] font-black leading-[1.0] tracking-tight text-[var(--text)] sm:text-[44px]">
            {t.createAccount}.
          </h1>
          <p className="text-[15px] font-medium leading-relaxed text-[var(--text-muted)]">
            Your first plan is waiting.
          </p>
        </motion.div>

        {/* Form — no card wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: "easeOut", delay: 0.1 }}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-[14px] border border-[rgba(255,68,68,0.4)] bg-[rgba(255,68,68,0.08)] px-4 py-3 text-[13px] font-medium text-[#ff6666]">
                {error}
              </div>
            )}

            <div className="mb-3">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{t.nameLabel}</div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="min-h-[54px] w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--border-strong)]"
              />
            </div>

            <div className="mb-3">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{t.email}</div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect="off"
                required
                className="min-h-[54px] w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--border-strong)]"
              />
            </div>

            <div className="mb-6">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{t.password}</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="min-h-[54px] w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--border-strong)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`motion-lift mb-4 flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-0 bg-[var(--accent)] px-4 text-[15px] font-black text-[#0b1715] shadow-[0_0_32px_rgba(107,191,184,0.3)] transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[rgba(0,0,0,0.15)] border-t-[#0b1715]" />
                  {t.creatingAccount}
                </>
              ) : t.signUp}
            </button>
          </form>

          <div className="mb-4 flex items-center gap-3">
            <hr className="flex-1 border-0 border-t border-[var(--border)]" />
            <span className="text-[11px] text-[var(--text-muted)]">{t.orContinueWith}</span>
            <hr className="flex-1 border-0 border-t border-[var(--border)]" />
          </div>

          <AuthGoogleButton label={t.continueGoogle} />

          <p className="mt-7 text-center text-xs text-[var(--text-muted)]">
            {t.hasAccount}{" "}
            <span
              className="cursor-pointer font-bold text-[var(--text)]"
              onClick={() => router.push("/login")}
            >
              {t.signIn}
            </span>
          </p>
        </motion.div>
      </main>
    </div>
  )
}
