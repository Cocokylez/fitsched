import { auth } from "@/lib/auth"
import { internalError, unauthorized } from "@/lib/apiResponse"
import { db } from "@/lib/db"
import { awardFitTokensForWorkoutLogTx } from "@/lib/fitTokens"
import { serverEnv } from "@/lib/env"
import { rateLimitByUser, rateLimitPresets, safeError, validateSameOrigin } from "@/lib/security"
import { cleanStringSchema, dateIdSchema, parseJsonBody, parseQuery, strictObject, z } from "@/lib/validation"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

const completedExerciseSchema = strictObject({
  name: cleanStringSchema(100, 1),
  sets: z.coerce.number().int().min(1).max(10).default(3),
  reps: z.coerce.number().int().min(1).max(200).default(12),
})

const workoutLogBodySchema = strictObject({
  date: dateIdSchema,
  workoutName: cleanStringSchema(100, 1),
  exercises: z.array(completedExerciseSchema).min(1).max(20),
})

const workoutLogGetQuerySchema = strictObject({
  date: dateIdSchema.optional(),
})

const workoutSessionLogSelect = {
  id: true,
  date: true,
  workoutName: true,
  exercises: true,
  completedAt: true,
} as const

function getTodayDateId() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: serverEnv.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  return `${year}-${month}-${day}`
}

function isSerializableConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034"
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.read, "workout-log:get")
    if (limited) return limited

    const parsedQuery = parseQuery(req, workoutLogGetQuerySchema)
    if (parsedQuery.response) return parsedQuery.response
    const { date } = parsedQuery.data

    const logs = await db.workoutSessionLog.findMany({
      where: {
        userId: session.user.id,
        ...(date ? { date } : {}),
      },
      select: workoutSessionLogSelect,
      orderBy: { completedAt: "desc" },
      take: date ? 10 : 365,
    })

    return NextResponse.json(logs)
  } catch (error) {
    return internalError(error, { route: "workout-log:get" }, "Failed to fetch workout logs")
  }
}

export async function POST(req: Request) {
  try {
    const originError = validateSameOrigin(req)
    if (originError) return originError

    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const userId = session.user.id
    const limited = rateLimitByUser(req, userId, rateLimitPresets.strictWrite, "workout-log:post")
    if (limited) return limited

    const parsedBody = await parseJsonBody(req, workoutLogBodySchema)
    if (parsedBody.response) return parsedBody.response
    const { date, workoutName, exercises } = parsedBody.data

    if (date !== getTodayDateId()) {
      return NextResponse.json(
        { error: "Only today's workout can earn FitTokens", todayOnly: true },
        { status: 403 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      const existingLog = await tx.workoutSessionLog.findFirst({
        where: {
          userId,
          date,
        },
        select: workoutSessionLogSelect,
        orderBy: { completedAt: "desc" },
      })

      if (existingLog) {
        return {
          alreadyCompleted: true,
          log: existingLog,
          fitTokenReward: {
            awarded: false,
            amount: 0,
            balance: 0,
            transactions: [],
          },
        }
      }

      const createdLog = await tx.workoutSessionLog.create({
        data: {
          userId,
          date,
          workoutName,
          exercises,
        },
        select: workoutSessionLogSelect,
      })

      const reward = await awardFitTokensForWorkoutLogTx(
        tx,
        userId,
        createdLog.id,
      )

      return { log: createdLog, fitTokenReward: reward }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    if (result.alreadyCompleted) {
      return NextResponse.json(
        {
          error: "Workout already completed for this date",
          alreadyCompleted: true,
          log: result.log,
        },
        { status: 409 }
      )
    }

    return NextResponse.json({ ...result.log, fitTokenReward: result.fitTokenReward }, { status: 201 })
  } catch (error) {
    if (isSerializableConflict(error)) {
      return NextResponse.json(
        { error: "Workout completion is already being processed", alreadyCompleted: true },
        { status: 409 }
      )
    }

    return internalError(error, { route: "workout-log:post" }, "Failed to save workout log")
  }
}
