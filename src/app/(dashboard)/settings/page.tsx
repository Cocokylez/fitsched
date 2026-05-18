"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Activity, Building2, Dumbbell, Home, Settings } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { SkeletonCard } from "@/components/Skeleton"

const ACCENT = "#6bbfb8"

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" as const } },
}

type WorkoutEnvironment = "home_bodyweight" | "home_dumbbells" | "gym"
type WorkoutSetupTextKey = "homeWorkout" | "noEquipment" | "homeDumbbells" | "dumbbellAccess" | "gym" | "fullEquipment"

const WORKOUT_SETUP_OPTIONS: Array<{
  id: WorkoutEnvironment
  Icon: typeof Home
  labelKey: WorkoutSetupTextKey
  subKey: WorkoutSetupTextKey
}> = [
  { id: "home_bodyweight", Icon: Home, labelKey: "homeWorkout", subKey: "noEquipment" },
  { id: "home_dumbbells", Icon: Dumbbell, labelKey: "homeDumbbells", subKey: "dumbbellAccess" },
  { id: "gym", Icon: Building2, labelKey: "gym", subKey: "fullEquipment" },
]

interface WorkoutLog {
  id: string
  date: string
  workoutName: string
  completedAt: string
  exercises: Array<{ name: string; sets: number; reps: number }>
}

interface ProfileData {
  workoutsPerWeek?: number | null
  workoutEnvironment?: WorkoutEnvironment | null
}

interface FitTokenData {
  balance: number
  transactions: Array<{
    id: string
    amount: number
    reason: string
    createdAt: string
    workoutName: string
  }>
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "User"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function toDateId(date: Date) {
  return date.toISOString().split("T")[0]
}

function getWeekId(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return toDateId(monday)
}

function calculateCurrentStreak(logs: WorkoutLog[]) {
  const uniqueDates = new Set(logs.map((log) => toDateId(new Date(log.completedAt))))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    if (!uniqueDates.has(toDateId(expected))) break
    streak++
  }
  return streak
}

function calculateLongestStreak(logs: WorkoutLog[]) {
  const timestamps = Array.from(
    new Set(logs.map((log) => {
      const date = new Date(log.completedAt)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    }))
  ).sort((a, b) => a - b)

  let best = 0
  let current = 0
  let previous: number | null = null
  const oneDay = 24 * 60 * 60 * 1000

  timestamps.forEach((timestamp) => {
    current = previous !== null && timestamp - previous === oneDay ? current + 1 : 1
    best = Math.max(best, current)
    previous = timestamp
  })

  return best
}

function getCurrentWeekCount(logs: WorkoutLog[]) {
  const thisWeek = getWeekId(new Date())
  return logs.filter((log) => getWeekId(new Date(log.completedAt)) === thisWeek).length
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame = 0
    const totalFrames = 34
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / 850, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      frame++
      if (progress < 1 && frame < totalFrames * 2) requestAnimationFrame(tick)
    }
    const animation = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animation)
  }, [value])

  return <>{display}{suffix}</>
}

function formatFitTokenAmount(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatTokenReason(reason: string, workoutName: string) {
  if (reason === "streak_bonus") return "Streak bonus"
  if (reason === "workout_complete") return `${workoutName} workout`
  return reason.replace(/_/g, " ")
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="text-[var(--text-muted)] shrink-0">
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, language, cycleLanguage } = useLanguage()
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(3)
  const [workoutEnvironment, setWorkoutEnvironment] = useState<WorkoutEnvironment>("gym")
  const [savingWorkoutEnvironment, setSavingWorkoutEnvironment] = useState(false)
  const [fitTokens, setFitTokens] = useState<FitTokenData>({ balance: 0, transactions: [] })

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const checkCalendar = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/sync")
      if (res.ok) {
        const data = await res.json()
        setIsCalendarConnected(data.connected)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    const load = async () => {
      setLoading(true)
      try {
        const [calendarRes, logRes, profileRes, tokenRes] = await Promise.all([
          fetch("/api/calendar/sync"),
          fetch("/api/workout-log"),
          fetch("/api/onboarding"),
          fetch("/api/tokens"),
        ])
        if (calendarRes.ok) {
          const data = await calendarRes.json()
          setIsCalendarConnected(data.connected)
        }
        if (logRes.ok) setLogs(await logRes.json())
        if (profileRes.ok) {
          const profile = (await profileRes.json()) as ProfileData
          if (profile.workoutsPerWeek) setWorkoutsPerWeek(profile.workoutsPerWeek)
          if (profile.workoutEnvironment) setWorkoutEnvironment(profile.workoutEnvironment)
        }
        if (tokenRes.ok) setFitTokens((await tokenRes.json()) as FitTokenData)
      } catch {}
      setLoading(false)
    }
    load()
  }, [status])

  const connectCalendar = async () => {
    setConnecting(true)
    try {
      const res = await fetch("/api/calendar/connect")
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url
      }
    } catch {}
    setConnecting(false)
  }

  const syncCalendar = async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/calendar/sync", { method: "POST" })
      if (res.ok) checkCalendar()
    } catch {}
    setSyncing(false)
  }

  const disconnectCalendar = async () => {
    try {
      const res = await fetch("/api/calendar/sync", { method: "DELETE" })
      if (res.ok) setIsCalendarConnected(false)
    } catch {}
  }

  const saveWorkoutEnvironment = async (next: WorkoutEnvironment) => {
    const previous = workoutEnvironment
    setWorkoutEnvironment(next)
    setSavingWorkoutEnvironment(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutEnvironment: next }),
      })
      if (!res.ok) throw new Error("Failed to save workout setup")
    } catch {
      setWorkoutEnvironment(previous)
    } finally {
      setSavingWorkoutEnvironment(false)
    }
  }

  const togglePush = async () => {
    if (!("Notification" in window)) return
    if (pushEnabled) { setPushEnabled(false); return }
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      setPushEnabled(true)
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" })
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""),
        })
        await fetch("/api/push/subscribe", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        })
      } catch {}
    }
  }

  const profileName = session?.user?.name || t.user
  const profileEmail = session?.user?.email || ""
  const initials = getInitials(profileName, profileEmail)

  const stats = useMemo(() => {
    const totalWorkouts = logs.length
    const totalExercisesDone = logs.reduce((sum, log) => sum + (log.exercises?.length || 0), 0)
    const currentWeek = getCurrentWeekCount(logs)
    const currentStreak = calculateCurrentStreak(logs)
    const longestStreak = calculateLongestStreak(logs)
    return { totalWorkouts, totalExercisesDone, currentWeek, currentStreak, longestStreak }
  }, [logs])

  const currentWeekPct = workoutsPerWeek > 0
    ? Math.min(100, Math.round((stats.currentWeek / workoutsPerWeek) * 100))
    : 0

  // Derive join month from oldest log or session
  const joinLabel = useMemo(() => {
    if (logs.length === 0) return null
    const oldest = logs.reduce((min, log) =>
      log.completedAt < min ? log.completedAt : min, logs[0].completedAt)
    const d = new Date(oldest)
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()
  }, [logs])

  const statRows = [
    { label: "Workouts done", sub: "lifetime", value: stats.totalWorkouts, suffix: "" },
    { label: "Exercises done", sub: "lifetime", value: stats.totalExercisesDone, suffix: "" },
    { label: "This week", sub: `${stats.currentWeek} of ${workoutsPerWeek} sessions`, value: currentWeekPct, suffix: "%" },
    { label: "Best streak", sub: "days", value: stats.longestStreak, suffix: "" },
  ]

  return (
    <div className="min-h-dvh bg-transparent px-4 pb-[118px] pt-8 sm:px-6">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto w-full max-w-[520px]">

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8 flex items-center justify-between">
          <h1 className="display-text text-[32px] font-black leading-none text-[var(--text)]">Profile</h1>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] transition-colors active:bg-[var(--surface)]"
          >
            <Settings size={18} strokeWidth={1.8} />
          </button>
        </motion.div>

        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </motion.div>
        ) : (
          <>
            {/* Avatar hero */}
            <motion.div variants={fadeUp} className="mb-7 flex flex-col items-center">
              {/* Ring + avatar */}
              <div className="relative mb-3">
                <svg width="116" height="116" viewBox="0 0 116 116" fill="none" aria-hidden="true" className="absolute inset-0">
                  <circle cx="58" cy="58" r="54" stroke="rgba(107,191,184,0.18)" strokeWidth="2.5" />
                  <circle cx="58" cy="58" r="54" stroke="#6bbfb8" strokeWidth="2.5"
                    strokeDasharray="280 60" strokeLinecap="round"
                    strokeDashoffset="72"
                    style={{ filter: "drop-shadow(0 0 6px rgba(107,191,184,0.5))" }}
                  />
                </svg>
                <div className="relative m-[8px] flex h-[100px] w-[100px] items-center justify-center rounded-full text-white"
                  style={{
                    background: "linear-gradient(145deg, rgba(107,191,184,0.95), rgba(32,68,64,0.96))",
                    boxShadow: "0 8px 32px rgba(107,191,184,0.28)",
                  }}
                >
                  <span className="display-text text-[28px] font-black tracking-tight">{initials}</span>
                </div>
                {/* Streak badge */}
                {stats.currentStreak > 0 && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-lg"
                    style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}
                  >
                    <span className="text-[13px]">🔥</span>
                    <span className="number-text text-[12px] font-black text-[#1a1a1a]">{stats.currentStreak} d</span>
                  </div>
                )}
              </div>

              {/* Name / email / join */}
              <h2 className="display-text mt-3 text-[24px] font-black text-[var(--text)]">{profileName}</h2>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">{profileEmail}</p>
              {joinLabel && (
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Joined {joinLabel}
                </p>
              )}

              {/* Token pills */}
              <div className="mt-5 flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border px-4 py-2"
                  style={{ borderColor: "rgba(107,191,184,0.36)", background: "rgba(107,191,184,0.1)" }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-black"
                    style={{ borderColor: "rgba(107,191,184,0.4)", color: ACCENT }}
                  >FT</span>
                  <span className="text-[13px] font-bold" style={{ color: ACCENT }}>
                    FitTokens · <span className="number-text font-black">{formatFitTokenAmount(fitTokens.balance)}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/withdrawal")}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[13px] font-bold text-[var(--text)] transition-colors active:bg-[var(--surface)]"
                >
                  Withdraw
                </button>
              </div>
            </motion.div>

            {/* BY THE NUMBERS */}
            <motion.div variants={fadeUp}>
              <div className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                By the numbers
              </div>
              <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--panel)]">
                {statRows.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-5 py-4 ${i < statRows.length - 1 ? "border-b border-[var(--border)]" : ""}`}
                  >
                    <div>
                      <div className="text-[15px] font-bold text-[var(--text)]">{row.label}</div>
                      <div className="mt-0.5 text-[12px] text-[var(--text-muted)]">{row.sub}</div>
                    </div>
                    <div className="number-text text-[28px] font-black leading-none text-[var(--text)]">
                      <AnimatedNumber value={row.value} suffix={row.suffix} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Body report link */}
            <motion.div variants={fadeUp} className="mt-3">
              <button
                type="button"
                onClick={() => router.push("/report")}
                className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--panel)] px-5 py-4 text-left transition-colors active:bg-[var(--surface)]"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-[var(--border-strong)] bg-[var(--accent-soft)]" style={{ color: ACCENT }}>
                    <Activity size={20} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-[var(--text)]">Body report</span>
                    <span className="block mt-0.5 text-[12px] text-[var(--text-muted)]">BMI, weight, injury notes</span>
                  </span>
                </span>
                <ChevronRightIcon />
              </button>
            </motion.div>

            {/* FitToken Earnings */}
            <motion.div variants={fadeUp}>
              <div className="mb-3 mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                FitToken Earnings
              </div>
              <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--panel)]">
                {fitTokens.transactions.length > 0 ? (
                  fitTokens.transactions.map((tx, i) => (
                    <div
                      key={tx.id}
                      className={`flex items-center justify-between gap-3 px-5 py-3.5 ${i < fitTokens.transactions.length - 1 ? "border-b border-[var(--border)]" : ""}`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-[var(--text)]">
                          {formatTokenReason(tx.reason, tx.workoutName)}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="shrink-0 text-[13px] font-black" style={{ color: ACCENT }}>
                        +{formatFitTokenAmount(tx.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center text-[13px] text-[var(--text-muted)]">
                    Complete a workout to earn your first FitToken.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div variants={fadeUp}>
              <div className="mb-3 mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {t.calendar}
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] px-5 py-4">
                {isCalendarConnected ? (
                  <>
                    <div className="text-[14px] font-semibold text-[var(--text)]">{t.googleConnected}</div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t.readOnly}</div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={syncCalendar} disabled={syncing}
                        className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[13px] text-[var(--text)] disabled:opacity-50">
                        {syncing ? t.syncing : t.syncNow}
                      </button>
                      <button onClick={disconnectCalendar}
                        className="rounded-[10px] border border-[rgba(255,50,50,0.3)] bg-[rgba(255,50,50,0.1)] px-4 py-2 text-[13px] text-[#d96060]">
                        {t.disconnect}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center">
                    <div className="mb-1 text-[15px] font-bold text-[var(--text)]">{t.connectCalendar}</div>
                    <p className="mb-4 text-[12px] leading-relaxed text-[var(--text-muted)]">{t.syncDescription}</p>
                    <button onClick={connectCalendar} disabled={connecting}
                      className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-5 py-2.5 text-[13px] font-semibold text-[var(--text)] disabled:opacity-50">
                      {connecting ? t.connecting : t.signInWithGoogle}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Workout Setup */}
            <motion.div variants={fadeUp}>
              <div className="mb-3 mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {t.preferences}
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] px-5 py-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-bold text-[var(--text)]">{t.workoutSetup}</div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t.workoutSetupDescription}</div>
                  </div>
                  {savingWorkoutEnvironment && (
                    <div className="pt-0.5 text-[11px] font-bold text-[var(--text-muted)]">{t.saving}</div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {WORKOUT_SETUP_OPTIONS.map((option) => {
                    const selected = workoutEnvironment === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => saveWorkoutEnvironment(option.id)}
                        disabled={savingWorkoutEnvironment}
                        className="flex min-h-[86px] flex-col items-center justify-center gap-1.5 rounded-[14px] border px-2 py-3 text-center transition-colors disabled:opacity-70"
                        style={{
                          border: `1px solid ${selected ? "rgba(107,191,184,0.72)" : "var(--border)"}`,
                          background: selected ? "rgba(107,191,184,0.12)" : "var(--surface-2)",
                          color: selected ? ACCENT : "var(--text)",
                        }}
                      >
                        <option.Icon size={18} strokeWidth={1.8} />
                        <span className="text-[12px] font-extrabold leading-tight">{t[option.labelKey]}</span>
                        <span className="text-[10px] leading-tight text-[var(--text-muted)]">{t[option.subKey]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Push + Language + Version */}
            <motion.div variants={fadeUp} className="mt-3 overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--panel)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div>
                  <div className="text-[14px] font-semibold text-[var(--text)]">{t.pushNotifications}</div>
                  <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{pushEnabled ? t.enabled : t.workoutReminders}</div>
                </div>
                <div onClick={togglePush} className="relative h-7 w-12 cursor-pointer rounded-full transition-colors"
                  style={{ background: pushEnabled ? ACCENT : "var(--border)" }}>
                  <div className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-[#e8e8e8] shadow-sm transition-transform"
                    style={{ transform: pushEnabled ? "translateX(24px)" : "translateX(3px)" }} />
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div className="text-[14px] font-semibold text-[var(--text)]">{t.language}</div>
                <motion.button onClick={cycleLanguage} whileTap={{ scale: 0.9 }}
                  className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-1.5 text-[13px] font-semibold text-[var(--text)] min-w-[48px] text-center">
                  <motion.span key={language} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    {language}
                  </motion.span>
                </motion.button>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="text-[14px] font-semibold text-[var(--text)]">{t.version}</div>
                <div className="text-[13px] text-[var(--text-muted)]">1.0.0</div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      {!loading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut", delay: 0.22 }}
          className="mx-auto mt-5 w-full max-w-[520px] px-4 sm:px-6"
        >
          <button
            onClick={async () => { await signOut({ callbackUrl: "/login", redirect: true }) }}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[rgba(255,50,50,0.25)] bg-[rgba(255,50,50,0.09)] py-3.5 text-[14px] font-semibold text-[#d96060]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <motion.span key={language} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {t.signOut}
            </motion.span>
          </button>
          <div className="mt-4 text-center text-[11px] text-[var(--text-muted)]">{t.fitSched} v1.0.0</div>
        </motion.div>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
