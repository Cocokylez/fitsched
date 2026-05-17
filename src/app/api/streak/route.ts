import { auth } from "@/lib/auth"
import { internalError, unauthorized } from "@/lib/apiResponse"
import { db } from "@/lib/db"
import { serverEnv } from "@/lib/env"
import { rateLimitByUser, rateLimitPresets } from "@/lib/security"
import { parseQuery, strictObject } from "@/lib/validation"
import { NextResponse } from "next/server"

interface StreakData {
  streak: number
  previousStreak: number
  streakBroken: boolean
  lastCompletedDate: string | null
  newMilestone: number | null
}

const cache = new Map<string, { data: StreakData; expiresAt: number }>()
const CACHE_TTL = 30_000

function getLocalDateId(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: serverEnv.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  return `${year}-${month}-${day}`
}

function addDays(dateId: string, days: number) {
  const date = new Date(`${dateId}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().split("T")[0]
}

function countStreakFrom(sortedDates: string[], startDate: string) {
  let streak = 0

  for (let i = 0; i < sortedDates.length; i++) {
    const expected = addDays(startDate, -i)
    if (sortedDates[i] === expected) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }

    const userId = session.user.id
    const limited = rateLimitByUser(req, userId, rateLimitPresets.read, "streak:get")
    if (limited) return limited

    const parsedQuery = parseQuery(req, strictObject({}))
    if (parsedQuery.response) return parsedQuery.response

    const cached = cache.get(userId)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data)
    }

    const logs = await db.workoutSessionLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: { date: true },
    })

    const uniqueDates = new Set<string>()
    logs.forEach((log) => {
      uniqueDates.add(log.date)
    })

    const sortedDates = Array.from(uniqueDates).sort().reverse()
    const today = getLocalDateId()
    const yesterday = getLocalDateId(-1)
    const lastCompletedDate = sortedDates[0] || null
    const streakAnchor = lastCompletedDate === today || lastCompletedDate === yesterday ? lastCompletedDate : null
    const streak = streakAnchor ? countStreakFrom(sortedDates, streakAnchor) : 0
    const previousStreak = lastCompletedDate ? countStreakFrom(sortedDates, lastCompletedDate) : 0
    const streakBroken = Boolean(lastCompletedDate && lastCompletedDate < yesterday)

    const MILESTONES = [3, 7, 14, 30]
    let newMilestone: number | null = null

    if (streak > 0) {
      for (const ms of MILESTONES) {
        if (streak >= ms) {
          const existing = await db.streakMilestone.findUnique({
            where: { userId_milestone: { userId, milestone: ms } },
          })
          if (!existing) {
            await db.streakMilestone.create({
              data: { userId, milestone: ms },
            })
            newMilestone = ms
          }
        }
      }
    }

    const result: StreakData = {
      streak,
      previousStreak,
      streakBroken,
      lastCompletedDate,
      newMilestone,
    }
    cache.set(userId, { data: result, expiresAt: Date.now() + CACHE_TTL })

    return NextResponse.json(result)
  } catch (error) {
    return internalError(error, { route: "streak:get" }, "Failed to fetch streak")
  }
}
