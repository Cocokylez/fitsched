import { auth } from "@/lib/auth";
import { internalError, unauthorized } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { ensureSystemExercises } from "@/lib/systemExercises";
import { rateLimitByIp, rateLimitByUser, rateLimitPresets, safeError, validateSameOrigin } from "@/lib/security";
import { cleanStringSchema, idSchema, optionalCleanStringSchema, parseJsonBody, parseQuery, strictObject, z } from "@/lib/validation";
import { NextResponse } from "next/server";

const muscleGroupSchema = z.enum(["CHEST", "BACK", "LEGS", "SHOULDERS", "CORE", "ARMS", "FULL_BODY", "CARDIO", "REST"]);
const equipmentSchema = z.enum(["BODYWEIGHT", "DUMBBELLS", "BARBELL", "MACHINE", "CABLES", "BANDS", "KETTLEBELL"]);
const difficultySchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

const exercisesGetQuerySchema = strictObject({
  muscleGroup: muscleGroupSchema.optional(),
  equipment: equipmentSchema.optional(),
})

const exerciseBodySchema = strictObject({
  name: cleanStringSchema(80, 1),
  description: optionalCleanStringSchema(500),
  muscleGroup: muscleGroupSchema,
  equipment: equipmentSchema.optional().default("BODYWEIGHT"),
  difficulty: difficultySchema.optional().default("BEGINNER"),
})

const exerciseDeleteQuerySchema = strictObject({
  id: idSchema,
})

const exerciseSelect = {
  id: true,
  name: true,
  description: true,
  muscleGroup: true,
  equipment: true,
  difficulty: true,
  isSystem: true,
  createdAt: true,
} as const

export async function GET(req: Request) {
  try {
    const session = await auth();
    const limited = session?.user?.id
      ? rateLimitByUser(req, session.user.id, rateLimitPresets.read, "exercises:get")
      : rateLimitByIp(req, rateLimitPresets.unauthenticated, "exercises:get:unauth");
    if (limited) return limited;

    const parsedQuery = parseQuery(req, exercisesGetQuerySchema);
    if (parsedQuery.response) return parsedQuery.response;
    const { muscleGroup, equipment } = parsedQuery.data;

    const where: any = { isSystem: true };
    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }
    if (equipment) {
      where.equipment = equipment;
    }

    await ensureSystemExercises(db);

    let exercises = await db.exercise.findMany({
      where,
      select: exerciseSelect,
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });

    if (session?.user?.id) {
      const userExercises = await db.exercise.findMany({
        where: {
          OR: [{ userId: session.user.id }],
        },
        select: exerciseSelect,
        orderBy: { name: "asc" },
      });
      exercises = [...exercises, ...userExercises];
    }

    return NextResponse.json(exercises);
  } catch (error) {
    return internalError(error, { route: "exercises:get" }, "Failed to fetch exercises");
  }
}

export async function POST(req: Request) {
  try {
    const originError = validateSameOrigin(req);
    if (originError) return originError;

    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "exercises:post");
    if (limited) return limited;

    const parsedBody = await parseJsonBody(req, exerciseBodySchema);
    if (parsedBody.response) return parsedBody.response;
    const { name, description, muscleGroup, equipment, difficulty } = parsedBody.data;

    const exercise = await db.exercise.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        muscleGroup,
        equipment,
        difficulty,
        isSystem: false,
      },
      select: exerciseSelect,
    });

    return NextResponse.json(exercise);
  } catch (error) {
    return internalError(error, { route: "exercises:post" }, "Failed to create exercise");
  }
}

export async function DELETE(req: Request) {
  try {
    const originError = validateSameOrigin(req);
    if (originError) return originError;

    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.write, "exercises:delete");
    if (limited) return limited;

    const parsedQuery = parseQuery(req, exerciseDeleteQuerySchema);
    if (parsedQuery.response) return parsedQuery.response;
    const { id } = parsedQuery.data;

    const exercise = await db.exercise.findUnique({ where: { id } });
    if (!exercise || exercise.isSystem) {
      return safeError("Cannot delete system exercises", 403);
    }

    if (exercise.userId !== session.user.id) {
      return safeError("Unauthorized", 403);
    }

    await db.exercise.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return internalError(error, { route: "exercises:delete" }, "Failed to delete exercise");
  }
}
