import { auth } from "@/lib/auth";
import { internalError, unauthorized } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { cleanText, clampInt, rateLimitByUser, rateLimitPresets, safeError, validateSameOrigin } from "@/lib/security";
import { cleanStringSchema, idSchema, optionalCleanStringSchema, parseJsonBody, parseQuery, strictObject, z } from "@/lib/validation";
import { NextResponse } from "next/server";

const workoutSetSchema = strictObject({
  reps: z.coerce.number().int().min(1).max(200),
  weight: z.coerce.number().min(0).max(1000).optional().nullable(),
  duration: z.coerce.number().int().min(1).max(3600).optional().nullable(),
  completed: z.boolean().optional().default(true),
})

const legacyWorkoutLogBodySchema = strictObject({
  exerciseId: idSchema,
  date: z.union([z.string(), z.number()]).optional(),
  sets: z.array(workoutSetSchema).min(1).max(20),
  duration: z.coerce.number().int().min(1).max(24 * 60).optional().nullable(),
  notes: optionalCleanStringSchema(500),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
})

const legacyWorkoutLogGetQuerySchema = strictObject({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  exerciseId: idSchema.optional(),
})

const legacyWorkoutLogSelect = {
  id: true,
  date: true,
  duration: true,
  notes: true,
  rating: true,
  completedAt: true,
  sets: {
    select: {
      id: true,
      setNumber: true,
      reps: true,
      weight: true,
      duration: true,
      completed: true,
    },
  },
  exercise: {
    select: {
      id: true,
      name: true,
      description: true,
      muscleGroup: true,
      equipment: true,
      difficulty: true,
      isSystem: true,
    },
  },
} as const

export async function POST(req: Request) {
  try {
    const originError = validateSameOrigin(req);
    if (originError) return originError;

    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "legacy-workout-log:post");
    if (limited) return limited;

    const parsedBody = await parseJsonBody(req, legacyWorkoutLogBodySchema);
    if (parsedBody.response) return parsedBody.response;

    const { exerciseId, sets, duration, notes, rating } = parsedBody.data;
    const date = new Date(parsedBody.data.date || Date.now());

    if (!exerciseId || Number.isNaN(date.getTime()) || sets.length === 0) {
      return safeError("Missing or invalid workout log fields");
    }

    const exercise = await db.exercise.findFirst({
      where: {
        id: exerciseId,
        OR: [{ isSystem: true }, { userId: session.user.id }],
      },
      select: { id: true },
    });

    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

    const log = await db.workoutLog.create({
      data: {
        userId: session.user.id,
        exerciseId,
        date,
        duration,
        notes,
        rating,
        sets: {
          create: sets.map((s, i: number) => ({
            setNumber: i + 1,
            reps: s.reps,
            weight: s.weight ?? null,
            duration: s.duration ?? null,
            completed: s.completed !== false,
          })),
        },
      },
      select: legacyWorkoutLogSelect,
    });

    return NextResponse.json(log);
  } catch (error) {
    return internalError(error, { route: "legacy-workout-log:post" }, "Failed to log workout");
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.read, "legacy-workout-log:get");
    if (limited) return limited;

    const parsedQuery = parseQuery(req, legacyWorkoutLogGetQuerySchema);
    if (parsedQuery.response) return parsedQuery.response;

    const { startDate, endDate, exerciseId } = parsedQuery.data;

    const where: any = { userId: session.user.id };
    if (startDate) {
      const parsedStart = new Date(startDate);
      if (Number.isNaN(parsedStart.getTime())) return safeError("Invalid date range");
      where.date = { gte: parsedStart };
    }
    if (endDate) {
      const parsedEnd = new Date(endDate);
      if (Number.isNaN(parsedEnd.getTime())) return safeError("Invalid date range");
      where.date = { ...where.date, lte: parsedEnd };
    }
    if (exerciseId) where.exerciseId = cleanText(exerciseId, 80);

    const logs = await db.workoutLog.findMany({
      where,
      select: legacyWorkoutLogSelect,
      orderBy: { date: "desc" },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return internalError(error, { route: "legacy-workout-log:get" }, "Failed to fetch logs");
  }
}
