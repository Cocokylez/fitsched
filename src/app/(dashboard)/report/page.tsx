"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Activity, Flame, PencilLine, Ruler, Save, Scale, ShieldCheck } from "lucide-react"
import { SkeletonCard } from "@/components/Skeleton"

type WorkoutLog = {
  id: string
  date: string
  workoutName: string
  completedAt: string
  exercises: Array<{ name: string; sets: number; reps: number }>
}

type ProfileData = {
  heightCm: number | null
  weightKg: number | null
  bmi: number | null
  hasInjury: boolean
  injuryNotes: string | null
  workoutsPerWeek?: number | null
}

type StreakData = {
  streak: number
  previousStreak: number
  streakBroken: boolean
  lastCompletedDate: string | null
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: "easeOut" as const } },
}

const muscleMap: Record<string, string> = {
  "Push-ups": "Chest",
  "Diamond Push-ups": "Chest",
  "Wide Push-ups": "Chest",
  "Incline Push-ups": "Chest",
  "Decline Push-ups": "Chest",
  "Bench Press": "Chest",
  "Dumbbell Fly": "Chest",
  "Chest Dips": "Chest",
  "Pull-ups": "Back",
  "Chin-ups": "Back",
  "Bent-over Row": "Back",
  "Dumbbell Row": "Back",
  "Superman Hold": "Back",
  "Reverse Fly": "Back",
  "Deadlift": "Back",
  "Lat Pulldown": "Back",
  "Pike Push-ups": "Shoulders",
  "Lateral Raises": "Shoulders",
  "Front Raises": "Shoulders",
  "Overhead Press": "Shoulders",
  "Arnold Press": "Shoulders",
  "Face Pull": "Shoulders",
  "Shrugs": "Shoulders",
  "Bicep Curls": "Arms",
  "Hammer Curls": "Arms",
  "Tricep Dips": "Arms",
  "Tricep Extension": "Arms",
  "Close-grip Push-ups": "Arms",
  "Preacher Curl": "Arms",
  "Concentration Curl": "Arms",
  "Bodyweight Squats": "Legs",
  "Walking Lunges": "Legs",
  "Glute Bridges": "Legs",
  "Wall Sit": "Legs",
  "Calf Raises": "Legs",
  "Bulgarian Split Squats": "Legs",
  "Romanian Deadlift": "Legs",
  "Goblet Squats": "Legs",
  "Step-ups": "Legs",
  "Jump Squats": "Legs",
  "Squats": "Legs",
  "Lunges": "Legs",
  "Plank": "Core",
  "Russian Twist": "Core",
  "Leg Raises": "Core",
  "Bicycle Crunches": "Core",
  "Mountain Climbers": "Core",
  "Hanging Knee Raises": "Core",
  "Plank Reaches": "Core",
  "Dead Bug": "Core",
  "Burpees": "Full Body",
  "Jumping Jacks": "Full Body",
  "High Knees": "Full Body",
  "Squat Thrusts": "Full Body",
  "Bear Crawl": "Full Body",
  "Tuck Jumps": "Full Body",
  "Box Jumps": "Full Body",
  "Curl to Press": "Arms",
  "Sprints": "Cardio",
  "Sprint": "Cardio",
  "Jump Rope": "Cardio",
  "Battle Ropes": "Cardio",
}

function toDateId(date: Date) {
  return date.toISOString().split("T")[0]
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function calculateLongestStreak(logs: WorkoutLog[]) {
  const timestamps = Array.from(
    new Set(logs.map((log) => {
      const date = new Date(log.completedAt)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })),
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

function calculateBmi(heightCm: string, weightKg: string) {
  const height = Number(heightCm)
  const weight = Number(weightKg)
  if (!height || !weight) return null
  return Math.round((weight / ((height / 100) ** 2)) * 10) / 10
}

function getBmiStatus(bmi: number | null) {
  if (!bmi) return { label: "Not set", color: "var(--text-muted)", position: 0 }
  if (bmi < 18.5) return { label: "Underweight", color: "#82a7ff", position: 22 }
  if (bmi < 25) return { label: "Healthy range", color: "#6bbfb8", position: 49 }
  if (bmi < 30) return { label: "Overweight", color: "#e7c85a", position: 67 }
  return { label: "High BMI", color: "#e76f6f", position: 86 }
}

function getTopMuscles(logs: WorkoutLog[]) {
  const counts: Record<string, number> = {}

  logs.forEach((log) => {
    log.exercises.forEach((exercise) => {
      const group = muscleMap[exercise.name] || "Other"
      counts[group] = (counts[group] || 0) + 1
    })
  })

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([group, count]) => ({ group, pct: total ? Math.round((count / total) * 100) : 0 }))
}

function ReportGlyph({ kind }: { kind: "body" | "week" | "bmi" }) {
  if (kind === "week") {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
        <rect x="8" y="13" width="32" height="25" rx="8" stroke="currentColor" strokeWidth="2" />
        <path d="M15 10v7M33 10v7M14 24h5M22 24h5M30 24h5M14 31h5M22 31h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === "bmi") {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
        <path d="M12 35c2.5-9 6.5-14 12-14s9.5 5 12 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M24 21l7-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="2" opacity=".42" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
      <path d="M24 8c5.5 0 9 4.2 9 10.3 0 4.4-2 8.1-4.5 11.4L24 36l-4.5-6.3C17 26.4 15 22.7 15 18.3 15 12.2 18.5 8 24 8Z" stroke="currentColor" strokeWidth="2.2" />
      <path d="M19 22h10M21 27h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export default function ReportPage() {
  const { status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [heightCm, setHeightCm] = useState("")
  const [weightKg, setWeightKg] = useState("")
  const [hasInjury, setHasInjury] = useState(false)
  const [injuryNotes, setInjuryNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return

    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, logRes, streakRes] = await Promise.all([
          fetch("/api/onboarding"),
          fetch("/api/workout-log"),
          fetch("/api/streak"),
        ])

        if (profileRes.ok) {
          const nextProfile = (await profileRes.json()) as ProfileData
          setProfile(nextProfile)
          setHeightCm(nextProfile.heightCm ? String(nextProfile.heightCm) : "")
          setWeightKg(nextProfile.weightKg ? String(nextProfile.weightKg) : "")
          setHasInjury(Boolean(nextProfile.hasInjury))
          setInjuryNotes(nextProfile.injuryNotes || "")
        }

        if (logRes.ok) setLogs(await logRes.json())
        if (streakRes.ok) setStreak(await streakRes.json())
      } catch {
        setMessage("Report data could not load. Try again in a moment.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [status])

  const bmi = calculateBmi(heightCm, weightKg) ?? profile?.bmi ?? null
  const bmiStatus = getBmiStatus(bmi)
  const longestStreak = useMemo(() => calculateLongestStreak(logs), [logs])
  const topMuscles = useMemo(() => getTopMuscles(logs), [logs])
  const totalExercises = logs.reduce((sum, log) => sum + log.exercises.length, 0)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(new Date(), index - 3))
  const completedDates = new Set(logs.map((log) => log.date))

  const saveMetrics = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: heightCm ? Number(heightCm) : null,
          weightKg: weightKg ? Number(weightKg) : null,
          hasInjury,
          injuryNotes,
        }),
      })

      if (!res.ok) throw new Error("Unable to save report")

      const nextProfile = (await res.json()) as ProfileData
      setProfile((current) => ({ ...(current || nextProfile), ...nextProfile }))
      setMessage("Body report updated.")
    } catch {
      setMessage("Could not save changes.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-transparent px-4 pb-6 pt-6">
      <motion.div initial="hidden" animate="visible" className="mx-auto max-w-[720px]">
        <motion.header variants={fadeUp} className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="label-text mb-2 text-[10px] text-[var(--text-muted)]">Body intelligence</p>
            <h1 className="display-text text-[34px] font-black leading-none text-[var(--text)]">Report</h1>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-[18px] border border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[var(--shadow)]">
            <ReportGlyph kind="body" />
          </div>
        </motion.header>

        {loading ? (
          <motion.div variants={fadeUp} className="grid gap-3">
            <SkeletonCard height="120px" />
            <SkeletonCard height="200px" />
            <SkeletonCard height="160px" />
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <motion.section variants={fadeUp} className="ios-inset-grouped p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-black text-[var(--text)]">Weekly pulse</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">Training consistency without cluttering Profile.</div>
                </div>
                <ReportGlyph kind="week" />
              </div>

              <div className="mb-4 grid grid-cols-7 gap-1.5">
                {weekDays.map((day) => {
                  const dateId = toDateId(day)
                  const active = dateId === toDateId(new Date())
                  const completed = completedDates.has(dateId)
                  return (
                    <div
                      key={dateId}
                      className={`grid min-h-[46px] place-items-center rounded-2xl border text-[13px] font-black ${
                        active
                          ? "border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                          : completed
                            ? "border-[rgba(107,191,184,0.18)] bg-[rgba(107,191,184,0.07)] text-[var(--text)]"
                            : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
                      }`}
                    >
                      {day.getDate()}
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 divide-x divide-[var(--border)] border-t border-[var(--border)] pt-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                    <Flame size={16} className="text-[#e8842a]" />
                    Day streak
                  </div>
                  <div className="number-text mt-1 text-[24px] font-black text-[var(--text)]">{streak?.streak || 0}</div>
                </div>
                <div className="pl-5 text-right">
                  <div className="text-xs font-bold text-[var(--text-muted)]">Personal best</div>
                  <div className="number-text mt-1 text-[24px] font-black text-[var(--text)]">{longestStreak} days</div>
                </div>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} className="grid grid-cols-2 gap-3">
              <div className="ios-inset-grouped p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Scale size={19} className="text-[var(--accent-strong)]" />
                  <span className="text-[11px] font-extrabold text-[var(--text-muted)]">Current</span>
                </div>
                <div className="number-text text-[31px] font-black text-[var(--text)]">
                  {weightKg || "--"}<span className="ml-1 text-base text-[var(--text-muted)]">kg</span>
                </div>
              </div>

              <div className="ios-inset-grouped p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Activity size={19} className="text-[var(--accent-strong)]" />
                  <span className="text-[11px] font-extrabold text-[var(--text-muted)]">Sessions</span>
                </div>
                <div className="number-text text-[31px] font-black text-[var(--text)]">{logs.length}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{totalExercises} exercises logged</div>
              </div>
            </motion.section>

            <motion.section variants={fadeUp} className="ios-inset-grouped overflow-hidden p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-black text-[var(--text)]">BMI</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">Used as context, not a judgment.</div>
                </div>
                <ReportGlyph kind="bmi" />
              </div>

              <div className="mb-5 flex items-end justify-between gap-4">
                <div className="number-text text-[42px] font-black leading-none text-[var(--text)]">{bmi ? bmi.toFixed(1) : "--"}</div>
                <div className="mb-1 flex items-center gap-2 text-sm font-extrabold" style={{ color: bmiStatus.color }}>
                  <span className="h-3 w-3 rounded-full" style={{ background: bmiStatus.color }} />
                  {bmiStatus.label}
                </div>
              </div>

              <div className="relative mb-7 h-[30px]">
                <div className="absolute inset-x-0 top-2 grid h-3 grid-cols-[1fr_1.35fr_1fr_1fr] overflow-hidden rounded-full">
                  <div className="bg-[#5266dd]" />
                  <div className="bg-[#6bc7c0]" />
                  <div className="bg-[#e7c85a]" />
                  <div className="bg-[#e76f6f]" />
                </div>
                <div
                  className="absolute top-0 h-0 w-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent border-t-[var(--text)] transition-[left] duration-300"
                  style={{ left: `calc(${bmiStatus.position}% - 7px)` }}
                />
                <div className="absolute inset-x-0 top-6 flex justify-between text-[11px] font-bold text-[var(--text-muted)]">
                  <span>15</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>

              <form onSubmit={saveMetrics} className="grid gap-3 border-t border-[var(--border)] pt-5">
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5">
                    <span className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-muted)]">
                      <Ruler size={14} />
                      Height
                    </span>
                    <input
                      type="number"
                      min="50"
                      max="260"
                      value={heightCm}
                      onChange={(event) => setHeightCm(event.target.value)}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--border-strong)]"
                      placeholder="cm"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-muted)]">
                      <Scale size={14} />
                      Weight
                    </span>
                    <input
                      type="number"
                      min="20"
                      max="400"
                      step="0.1"
                      value={weightKg}
                      onChange={(event) => setWeightKg(event.target.value)}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--border-strong)]"
                      placeholder="kg"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setHasInjury((value) => !value)}
                  className={`motion-lift flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                    hasInjury
                      ? "border-[rgba(231,111,111,0.34)] bg-[rgba(231,111,111,0.09)]"
                      : "border-[var(--border)] bg-[var(--surface-2)]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--panel)] text-[var(--accent-strong)]">
                      <ShieldCheck size={17} />
                    </span>
                    <span>
                      <span className="block text-sm font-black text-[var(--text)]">Injury note</span>
                      <span className="block text-xs text-[var(--text-muted)]">{hasInjury ? "FitSched will stay cautious." : "No active injury marked."}</span>
                    </span>
                  </span>
                  <span className="text-xs font-black text-[var(--text-muted)]">{hasInjury ? "On" : "Off"}</span>
                </button>

                {hasInjury && (
                  <label className="grid gap-1.5">
                    <span className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-muted)]">
                      <PencilLine size={14} />
                      Notes
                    </span>
                    <textarea
                      value={injuryNotes}
                      onChange={(event) => setInjuryNotes(event.target.value)}
                      className="min-h-[84px] resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold leading-relaxed text-[var(--text)] outline-none focus:border-[var(--border-strong)]"
                      placeholder="Example: avoid heavy knee impact this week."
                    />
                  </label>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="motion-lift flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--accent)] px-4 py-3.5 text-sm font-black text-[#0b1715] disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving" : "Update report"}
                </button>

                {message && <div className="text-center text-xs font-bold text-[var(--text-muted)]">{message}</div>}
              </form>
            </motion.section>

            <motion.section variants={fadeUp} className="ios-inset-grouped p-5">
              <div className="mb-4 text-[15px] font-black text-[var(--text)]">Most trained</div>
              {topMuscles.length > 0 ? (
                <div className="grid gap-3">
                  {topMuscles.map((muscle, index) => (
                    <div key={muscle.group}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-extrabold text-[var(--text)]">{muscle.group}</span>
                        <span className="number-text font-black text-[var(--accent-strong)]">{muscle.pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${muscle.pct}%` }}
                          transition={{ duration: 0.65, delay: index * 0.07, ease: "easeOut" }}
                          className="h-full rounded-full bg-[var(--accent)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-6 text-center text-sm font-semibold text-[var(--text-muted)]">
                  Complete a workout and your strongest patterns will appear here.
                </div>
              )}
            </motion.section>
          </div>
        )}
      </motion.div>
    </div>
  )
}
