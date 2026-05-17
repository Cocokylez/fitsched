import { auth } from "@/lib/auth"
import { internalError, unauthorized } from "@/lib/apiResponse"
import { db } from "@/lib/db"
import { cleanText, rateLimitByUser, rateLimitPresets, safeError, validateSameOrigin } from "@/lib/security"
import { cleanStringSchema, parseJsonBody, strictObject, z } from "@/lib/validation"
import { NextResponse } from "next/server"

const workoutEnvironmentSchema = z.enum(["home_bodyweight", "home_dumbbells", "gym"])
const fitnessGoalSchema = z.enum(["lose_weight", "build_muscle", "stay_active", "improve_endurance"])
const experienceLevelSchema = z.enum(["beginner", "intermediate", "advanced"])

const onboardingBodySchema = strictObject({
  heightCm: z.coerce.number().min(50).max(260).optional().nullable(),
  weightKg: z.coerce.number().min(20).max(400).optional().nullable(),
  hasInjury: z.boolean().optional().default(false),
  injuryNotes: cleanStringSchema(500).optional().default(""),
  workoutEnvironment: workoutEnvironmentSchema.nullable().optional(),
  fitnessGoal: fitnessGoalSchema.optional().default("stay_active"),
  experienceLevel: experienceLevelSchema.optional().default("beginner"),
  workoutsPerWeek: z.coerce.number().int().min(1).max(6).optional().default(3),
})

const onboardingPatchBodySchema = strictObject({
  workoutEnvironment: workoutEnvironmentSchema.optional(),
  heightCm: z.coerce.number().min(50).max(260).optional().nullable(),
  weightKg: z.coerce.number().min(20).max(400).optional().nullable(),
  hasInjury: z.boolean().optional(),
  injuryNotes: cleanStringSchema(500).optional(),
})

function parseWorkoutEnvironment(value: unknown) {
  return typeof value === "string" && workoutEnvironmentSchema.safeParse(value).success ? value : null
}

export async function POST(req: Request) {
  try {
    const originError = validateSameOrigin(req)
    if (originError) return originError

    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "onboarding:post")
    if (limited) return limited

    const parsedBody = await parseJsonBody(req, onboardingBodySchema)
    if (parsedBody.response) return parsedBody.response

    const body = parsedBody.data
    const heightCm = body.heightCm ?? null
    const weightKg = body.weightKg ?? null
    const bmi = heightCm && weightKg
      ? Math.round((weightKg / ((heightCm / 100) ** 2)) * 10) / 10
      : null

    await db.user.update({
      where: { id: session.user.id },
      data: {
        fitnessGoal: body.fitnessGoal,
        experienceLevel: body.experienceLevel,
        workoutsPerWeek: body.workoutsPerWeek,
        workoutEnvironment: body.workoutEnvironment ?? null,
        heightCm,
        weightKg,
        bmi,
        hasInjury: body.hasInjury,
        injuryNotes: body.hasInjury ? cleanText(body.injuryNotes, 500) : null,
        onboardingCompleted: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return internalError(error, { route: "onboarding:post" }, "Failed to save onboarding")
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
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "onboarding:patch")
    if (limited) return limited

    const parsedBody = await parseJsonBody(req, onboardingPatchBodySchema)
    if (parsedBody.response) return parsedBody.response
    const body = parsedBody.data

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        heightCm: true,
        weightKg: true,
        hasInjury: true,
      },
    })

    if (!currentUser) return unauthorized()

    const data: {
      workoutEnvironment?: string
      heightCm?: number | null
      weightKg?: number | null
      bmi?: number | null
      hasInjury?: boolean
      injuryNotes?: string | null
    } = {}

    if (body.workoutEnvironment !== undefined) {
      const workoutEnvironment = parseWorkoutEnvironment(body.workoutEnvironment)
      if (!workoutEnvironment) {
        return safeError("Invalid workout environment")
      }
      data.workoutEnvironment = workoutEnvironment
    }

    const nextHeight = body.heightCm !== undefined ? body.heightCm ?? null : currentUser.heightCm
    const nextWeight = body.weightKg !== undefined ? body.weightKg ?? null : currentUser.weightKg

    if (body.heightCm !== undefined || body.weightKg !== undefined) {
      data.heightCm = nextHeight
      data.weightKg = nextWeight
      data.bmi = nextHeight && nextWeight
        ? Math.round((nextWeight / ((nextHeight / 100) ** 2)) * 10) / 10
        : null
    }

    if (body.hasInjury !== undefined) {
      data.hasInjury = body.hasInjury
      data.injuryNotes = body.hasInjury ? cleanText(body.injuryNotes || "", 500) : null
    } else if (body.injuryNotes !== undefined && currentUser.hasInjury) {
      data.injuryNotes = cleanText(body.injuryNotes, 500)
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        workoutEnvironment: true,
        heightCm: true,
        weightKg: true,
        bmi: true,
        hasInjury: true,
        injuryNotes: true,
      },
    })

    return NextResponse.json(user ? {
      ...user,
      workoutEnvironment: parseWorkoutEnvironment(user.workoutEnvironment) || "gym",
    } : user)
  } catch (error) {
    return internalError(error, { route: "onboarding:patch" }, "Failed to update onboarding")
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.read, "onboarding:get")
    if (limited) return limited

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        fitnessGoal: true,
        experienceLevel: true,
        workoutsPerWeek: true,
        workoutEnvironment: true,
        heightCm: true,
        weightKg: true,
        bmi: true,
        hasInjury: true,
        injuryNotes: true,
      },
    })

    return NextResponse.json(user ? {
      ...user,
      workoutEnvironment: parseWorkoutEnvironment(user.workoutEnvironment) || "gym",
    } : user)
  } catch (error) {
    return internalError(error, { route: "onboarding:get" }, "Failed to fetch onboarding")
  }
}
