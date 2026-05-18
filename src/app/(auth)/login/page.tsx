"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { AuthTopControls } from '@/components/AuthTopControls'
import { AuthGoogleButton } from '@/components/AuthGoogleButton'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email or password is incorrect')
      return
    }

    try {
      const response = await fetch('/api/onboarding', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        router.push(data?.onboardingCompleted ? '/schedule' : '/onboarding')
        return
      }
    } catch {}

    router.push('/schedule')
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
            {t.welcomeBack}.
          </h1>
          <p className="text-[15px] font-medium leading-relaxed text-[var(--text-muted)]">
            Let&apos;s keep the streak alive.
          </p>
        </motion.div>

        {/* Form — no card wrapper, fields sit on the background */}
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
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{t.email}</div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="min-h-[54px] w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--border-strong)]"
              />
            </div>

            <div className="mb-6">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{t.password}</div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="min-h-[54px] w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--border-strong)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`motion-lift mb-4 min-h-[54px] w-full cursor-pointer rounded-[18px] border-0 bg-[var(--accent)] px-4 text-[15px] font-black text-[#0b1715] shadow-[0_0_32px_rgba(107,191,184,0.3)] transition-opacity ${loading ? "opacity-55" : "opacity-100"}`}
            >
              {loading ? 'Signing in...' : t.signIn}
            </button>
          </form>

          <div className="mb-4 flex items-center gap-3">
            <hr className="flex-1 border-0 border-t border-[var(--border)]" />
            <span className="text-[11px] text-[var(--text-muted)]">{t.orContinueWith}</span>
            <hr className="flex-1 border-0 border-t border-[var(--border)]" />
          </div>

          <AuthGoogleButton label={t.continueGoogle} />

          <p className="mt-7 text-center text-xs text-[var(--text-muted)]">
            {t.noAccount}{' '}
            <span
              className="cursor-pointer font-bold text-[var(--text)]"
              onClick={() => router.push('/register')}
            >
              {t.signUp}
            </span>
          </p>
        </motion.div>
      </main>
    </div>
  )
}
