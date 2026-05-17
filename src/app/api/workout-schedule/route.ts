import { auth } from "@/lib/auth"
import { internalError, unauthorized } from "@/lib/apiResponse"
import { db } from "@/lib/db"
import { cleanText, clampInt, rateLimitByUser, rateLimitPresets, safeError, validateSameOrigin } from "@/lib/security"
import { cleanStringSchema, dateIdSchema, idSchema, optionalCleanStringSchema, parseJsonBody, parseQuery, strictObject, z } from "@/lib/validation"
import { NextResponse } from "next/server"

const sourceSchema = z.enum(["ai", "manual", "calendar", "workout"])

const scheduleExerciseSchema = strictObject({
  name: cleanStringSchema(100, 1),
  description: optionalCleanStringSchema(500),
  time: optionalCleanStringSchema(20),
  sets: z.coerce.number().int().min(1).max(10).optional().default(3),
  reps: z.coerce.number().int().min(1).max(200).optional().default(12),
})

const scheduleBodySchema = strictObject({
  date: dateIdSchema,
  workoutName: cleanStringSchema(100, 1),
  source: sourceSchema.optional().default("ai"),
  exercises: z.array(scheduleExerciseSchema).min(1).max(20),
})

const schedulePatchBodySchema = scheduleBodySchema.extend({
  id: idSchema,
  source: sourceSchema.optional().default("manual"),
})

const scheduleGetQuerySchema = strictObject({
  date: dateIdSchema.optional(),
  days: z.string().regex(/^\d+$/).transform((value) => clampInt(value, 1, 90, 7)).optional(),
})

const scheduleDeleteQuerySchema = strictObject({
  id: idSchema,
})

const workoutScheduleSelect = {
  id: true,
  date: true,
  workoutName: true,
  exercises: true,
  source: true,
  createdAt: true,
} as const

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.read, "workout-schedule:get")
    if (limited) return limited

    const parsedQuery = parseQuery(req, scheduleGetQuerySchema)
    if (parsedQuery.response) return parsedQuery.response

    const { date, days } = parsedQuery.data

    if (days) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startStr = startDate.toISOString().split("T")[0]

      const workouts = await db.workoutSchedule.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startStr },
        },
        select: workoutScheduleSelect,
        orderBy: { date: "desc" },
      })

      return NextResponse.json(workouts)
    }

    if (date) {
      const workouts = await db.workoutSchedule.findMany({
        where: {
          userId: session.user.id,
          date: date,
        },
        select: workoutScheduleSelect,
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(workouts)
    }

    return NextResponse.json([])
  } catch (error) {
    return internalError(error, { route: "workout-schedule:get" }, "Failed to fetch workout schedule")
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
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "workout-schedule:post")
    if (limited) return limited

    const parsedBody = await parseJsonBody(req, scheduleBodySchema)
    if (parsedBody.response) return parsedBody.response

    const { date, workoutName, exercises, source } = parsedBody.data

    const workout = await db.workoutSchedule.create({
      data: {
        userId: session.user.id,
        date,
        workoutName,
        exercises,
        source,
      },
      select: workoutScheduleSelect,
    })

    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    return internalError(error, { route: "workout-schedule:post" }, "Failed to save workout schedule")
  }
}

export async function PATCH(req: Request) {
  try {
    const originError = validateSameOrigin(req)
    if (originError) return originError

    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "workout-schedule:patch")
    if (limited) return limited

    const parsedBody = await parseJsonBody(req, schedulePatchBodySchema)
    if (parsedBody.response) return parsedBody.response

    const { id, date, workoutName, exercises, source } = parsedBody.data

    const existing = await db.workoutSchedule.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true },
    })

    if (!existing) {
      return safeError("Schedule not found", 404)
    }

    const workout = await db.workoutSchedule.update({
      where: { id },
      data: {
        date,
        workoutName,
        exercises,
        source,
      },
      select: workoutScheduleSelect,
    })

    return NextResponse.json(workout)
  } catch (error) {
    return internalError(error, { route: "workout-schedule:patch" }, "Failed to update workout schedule")
  }
}

export async function DELETE(req: Request) {
  try {
    const originError = validateSameOrigin(req)
    if (originError) return originError

    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "workout-schedule:delete")
    if (limited) return limited

    const parsedQuery = parseQuery(req, scheduleDeleteQuerySchema)
    if (parsedQuery.response) return parsedQuery.response
    const { id } = parsedQuery.data

    const workout = await db.workoutSchedule.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true },
    })

    if (!workout) {
      return safeError("Schedule not found", 404)
    }

    await db.workoutSchedule.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return internalError(error, { route: "workout-schedule:delete" }, "Failed to delete workout schedule")
  }
}
