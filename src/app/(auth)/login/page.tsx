"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { AuthTopControls } from '@/components/AuthTopControls'
import { AuthGoogleButton } from '@/components/AuthGoogleButton'

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

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
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-[var(--bg)] px-4 pb-9 pt-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(107,191,184,0.2),transparent_36%),linear-gradient(180deg,transparent,rgba(107,191,184,0.035))]" />
      <AuthTopControls />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto flex min-h-[292px] w-full max-w-[460px] flex-col items-center justify-center pt-14 text-center"
      >
        <div className="mb-4 h-px w-14 bg-[var(--accent)] opacity-70" />
        <div className="brand-wordmark text-[42px] font-black leading-[0.92] text-[var(--text)]">{t.fitSched}</div>
        <div className="mt-3 max-w-[250px] text-[13px] font-semibold leading-relaxed text-[var(--text-muted)]">{t.tagline}</div>
      </motion.div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
        className="relative z-[2] mx-auto -mt-12 w-full max-w-[430px] rounded-[34px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_46%),var(--panel)] px-5 pb-8 pt-7 shadow-[var(--shadow-lg)] sm:px-6 sm:pb-9 sm:pt-8"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.div variants={fadeIn}>
            <div className="display-text mb-1 text-[25px] font-black leading-none text-[var(--text)]">{t.welcomeBack}</div>
            <div className="mb-6 text-[13px] font-medium text-[var(--text-muted)]">{t.signInContinue}</div>
          </motion.div>

          <form onSubmit={handleSubmit}>
          {error && (
            <motion.div variants={fadeIn}>
              <div className="mb-4 rounded-[10px] border border-[#ff4444] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[#ff6666]">
                {error}
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeIn}>
            <div className="mb-1.5 text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)]">{t.email}</div>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoCapitalize="none"
              autoCorrect="off"
              className="mb-4 min-h-[54px] w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--text)] outline-none focus:border-[var(--border-strong)]"
            />
          </motion.div>

          <motion.div variants={fadeIn}>
            <div className="mb-1.5 text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)]">{t.password}</div>
            <input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mb-6 min-h-[54px] w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--text)] outline-none focus:border-[var(--border-strong)]"
            />
          </motion.div>

          <motion.div variants={fadeIn}>
            <button
              type="submit"
              disabled={loading}
              className={`motion-lift mb-5 min-h-[54px] w-full cursor-pointer rounded-[18px] border-0 bg-[var(--text)] px-4 text-[15px] font-black text-[var(--bg)] ${
                loading ? "opacity-55" : "opacity-100"
              }`}
            >
              {loading ? 'Signing in...' : t.signIn}
            </button>
          </motion.div>
          </form>

          <motion.div variants={fadeIn}>
            <div className="mb-5 flex items-center gap-3">
              <hr className="flex-1 border-0 border-t border-[var(--border)]" />
              <span className="text-[11px] text-[var(--text-muted)]">{t.orContinueWith}</span>
              <hr className="flex-1 border-0 border-t border-[var(--border)]" />
            </div>
          </motion.div>

          <motion.div variants={fadeIn}>
            <AuthGoogleButton label={t.continueGoogle} />
          </motion.div>

          <motion.div variants={fadeIn}>
            <p className="m-0 text-center text-xs text-[var(--text-muted)]">
              {t.noAccount}{' '}
              <span
                className="cursor-pointer font-bold text-[var(--text)]"
                onClick={() => router.push('/register')}
              >
                {t.signUp}
              </span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

    </div>
  )
}
