"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"
import { AuthTopControls } from "@/components/AuthTopControls"
import { AuthGoogleButton } from "@/components/AuthGoogleButton"

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
}

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
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto bg-[var(--bg)] px-4 pb-8 pt-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(107,191,184,0.14),transparent_34%)]" />
      <AuthTopControls />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex min-h-[250px] flex-col items-center justify-center pt-12"
      >
        <div className="brand-wordmark text-[35px] font-black leading-none text-[var(--text)]">{t.fitSched}</div>
        <div className="mt-1.5 text-[13px] text-[var(--text-muted)]">{t.startJourney}</div>
      </motion.div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        className="relative z-[2] mx-auto -mt-8 w-full max-w-[440px] rounded-[30px] border border-[var(--border)] bg-[var(--panel)] px-5 pb-8 pt-7 shadow-[var(--shadow-lg)] backdrop-blur-[24px] sm:px-6 sm:pb-10 sm:pt-8"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.div variants={fadeIn}>
            <div className="display-text mb-1 text-2xl font-extrabold text-[var(--text)]">{t.createAccount}</div>
            <div className="mb-6 text-[13px] text-[var(--text-muted)]">{t.itsFree}</div>
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
              <div className="mb-1.5 text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)]">{t.nameLabel}</div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="mb-4 min-h-[52px] w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--text)] outline-none"
              />
            </motion.div>

            <motion.div variants={fadeIn}>
              <div className="mb-1.5 text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)]">{t.email}</div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect="off"
                required
                className="mb-4 min-h-[52px] w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--text)] outline-none"
              />
            </motion.div>

            <motion.div variants={fadeIn}>
              <div className="mb-1.5 text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)]">{t.password}</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="mb-6 min-h-[52px] w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--text)] outline-none"
              />
            </motion.div>

            <motion.div variants={fadeIn}>
              <button
                type="submit"
                disabled={loading}
                className={`motion-lift mb-5 flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-[var(--text)] px-4 text-[15px] font-extrabold text-[var(--bg)] ${
                  loading ? "opacity-50" : "opacity-100"
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[rgba(0,0,0,0.15)] border-t-[var(--bg)]" />
                    {t.creatingAccount}
                  </>
                ) : t.signUp}
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
              {t.hasAccount}{" "}
              <span
                className="cursor-pointer font-bold text-[var(--text)]"
                onClick={() => router.push("/login")}
              >
                {t.signIn}
              </span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
