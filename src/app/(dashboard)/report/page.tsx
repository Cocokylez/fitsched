"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, MoreHorizontal, PencilLine, Ruler, Save, Scale, ShieldCheck } from "lucide-react"
import { SkeletonCard } from "@/components/Skeleton"
import FlameIcon from "@/components/FlameIcon"

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

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"]

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

  // Current week Mon–Sun — client-only to avoid SSR/hydration mismatch
  const [today, setToday] = useState<Date | null>(null)
  const [weekNumber, setWeekNumber] = useState<number | null>(null)
  useEffect(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    setToday(d)
    const start = new Date(d.getFullYear(), 0, 1)
    setWeekNumber(Math.ceil((((d.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7))
  }, [])
  const weekDays = useMemo(() => {
    if (!today) return []
    const dow = today.getDay()
    const monday = addDays(today, -((dow + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  }, [today])
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
    <div className="min-h-dvh bg-transparent px-4 pb-[118px] pt-8 sm:px-6">
      <motion.div initial="hidden" animate="visible" className="mx-auto w-full max-w-[640px]">
        <motion.header variants={fadeUp} className="mb-7 flex items-start justify-between">
          <div>
            <p className="label-text mb-1.5 text-[10px] text-[var(--text-muted)]">
              {weekNumber ? `WEEK ${weekNumber} · ` : ""}THIS WEEK
            </p>
            <h1 className="display-text text-[34px] font-black leading-[0.95] text-[var(--text)]">Report</h1>
          </div>
          <button
            type="button"
            className="mt-1 grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
          >
            <MoreHorizontal size={17} strokeWidth={2} />
          </button>
        </motion.header>

        {loading ? (
          <motion.div variants={fadeUp} className="grid gap-4">
            <SkeletonCard height="160px" />
            <SkeletonCard height="100px" />
            <SkeletonCard height="160px" />
          </motion.div>
        ) : (
          <div className="grid gap-4">

            {/* R1 Streak hero card */}
            <motion.section
              variants={fadeUp}
              className="relative overflow-hidden rounded-[24px]"
              style={{
                background: "linear-gradient(145deg, rgba(38,76,68,0.97) 0%, rgba(18,38,34,0.99) 100%)",
                border: "1px solid rgba(107,191,184,0.2)",
                boxShadow: "0 4px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(107,191,184,0.1)",
              }}
            >
              {/* Subtle glow overlay */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse at 15% -10%, rgba(107,191,184,0.14), transparent 55%)" }}
              />

              <div className="relative px-5 pb-4 pt-5">
                {/* Flame icon top-right */}
                <div className="absolute right-3 top-2 opacity-75" style={{ filter: "saturate(1.1) brightness(1.05)" }}>
                  <FlameIcon size={64} />
                </div>

                <div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(107,191,184,0.68)" }}>
                  Current Streak
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="number-text text-[58px] font-black leading-none text-white">{streak?.streak ?? 0}</span>
                  <span className="text-[19px] font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>days</span>
                </div>
                <div className="mt-2 text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.42)" }}>
                  Personal best ·{" "}
                  <span className="font-black" style={{ color: "rgba(107,191,184,0.88)" }}>{longestStreak} days</span>
                </div>
              </div>

              {/* Week strip */}
              <div className="px-4 pb-5 pt-3" style={{ borderTop: "1px solid rgba(107,191,184,0.12)" }}>
                <div className="grid grid-cols-7 gap-1.5">
                  {weekDays.map((day, i) => {
                    const dateId = toDateId(day)
                    const isToday = today ? dateId === toDateId(today) : false
                    const completed = completedDates.has(dateId)
                    const isPast = today ? day < today && !isToday : false
                    return (
                      <div key={dateId} className="flex flex-col items-center gap-1.5">
                        <span
                          className="text-[9px] font-black uppercase"
                          style={{ color: isToday ? "rgba(107,191,184,0.9)" : "rgba(255,255,255,0.32)" }}
                        >
                          {DAY_LETTERS[i]}
                        </span>
                        <div
                          className="flex h-9 w-full items-center justify-center rounded-[12px]"
                          style={{
                            background: isToday
                              ? "rgba(107,191,184,0.92)"
                              : completed
                                ? "rgba(107,191,184,0.2)"
                                : isPast
                                  ? "rgba(255,255,255,0.04)"
                                  : "rgba(255,255,255,0.06)",
                            border: isToday
                              ? "none"
                              : completed
                                ? "1px solid rgba(107,191,184,0.28)"
                                : "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          {isToday || completed ? (
                            <Check
                              size={14}
                              strokeWidth={3}
                              style={{ color: isToday ? "#0b1715" : "rgba(107,191,184,0.9)" }}
                            />
                          ) : (
                            <span
                              className="text-[12px] font-black"
                              style={{ color: isPast ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.38)" }}
                            >
                              {day.getDate()}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.section>

            {/* Stats row */}
            <motion.section variants={fadeUp} className="grid grid-cols-2 gap-3">
              <div className="ios-inset-grouped p-4">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">Weight</div>
                <div className="number-text flex items-baseline gap-1 leading-none">
                  <span className="text-[32px] font-black text-[var(--text)]">
                    {weightKg || <span className="text-[var(--text-muted)]">--</span>}
                  </span>
                  <span className="text-[14px] font-bold text-[var(--text-muted)]">kg</span>
                </div>
              </div>

              <div className="ios-inset-grouped p-4">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">Sessions</div>
                <div className="number-text flex items-baseline gap-1.5 leading-none">
                  <span className="text-[32px] font-black text-[var(--text)]">{logs.length}</span>
                  {profile?.workoutsPerWeek ? (
                    <span className="text-[16px] font-semibold text-[var(--text-muted)]">of {profile.workoutsPerWeek}</span>
                  ) : null}
                </div>
                <div className="mt-1.5 text-[12px] text-[var(--text-muted)]">{totalExercises} exercises</div>
              </div>
            </motion.section>

            {/* BMI */}
            <motion.section variants={fadeUp} className="ios-inset-grouped overflow-hidden p-4 min-[420px]:p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">BMI</span>
                <div className="flex items-baseline gap-2">
                  <span className="number-text text-[28px] font-black leading-none text-[var(--text)]">{bmi ? bmi.toFixed(1) : "--"}</span>
                  <span className="text-[14px] font-bold" style={{ color: bmiStatus.color }}>{bmiStatus.label}</span>
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

              <div className="text-[11px] text-[var(--text-muted)] mb-5">Used as context, not a judgment.</div>

              <form onSubmit={saveMetrics} className="grid gap-3 border-t border-[var(--border)] pt-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

            {/* Most trained */}
            <motion.section variants={fadeUp} className="ios-inset-grouped p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">Most Trained</span>
                <span className="text-[10px] text-[var(--text-muted)]">last 30 days</span>
              </div>
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
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-[16px] border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)]">
                    <Activity size={22} />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-muted)]">Complete a workout to see your patterns here.</p>
                </div>
              )}
            </motion.section>

          </div>
        )}
      </motion.div>
    </div>
  )
}
