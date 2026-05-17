import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { internalError, unauthorized } from "@/lib/apiResponse"
import { db } from "@/lib/db"
import { awardFitTokensForWorkoutLogTx } from "@/lib/fitTokens"
import { rateLimitByUser, rateLimitPresets, validateSameOrigin } from "@/lib/security"
import { idSchema, parseJsonBody, strictObject } from "@/lib/validation"
import { NextResponse } from "next/server"

const earnTokenBodySchema = strictObject({
  workoutLogId: idSchema,
})

export async function POST(req: Request) {
  try {
    const originError = validateSameOrigin(req)
    if (originError) return originError

    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const userId = session.user.id
    const limited = rateLimitByUser(req, userId, rateLimitPresets.strictWrite, "tokens:earn")
    if (limited) return limited

    const parsedBody = await parseJsonBody(req, earnTokenBodySchema)
    if (parsedBody.response) return parsedBody.response
    const { workoutLogId } = parsedBody.data

    const reward = await db.$transaction((tx) =>
      awardFitTokensForWorkoutLogTx(tx, userId, workoutLogId),
    )

    return NextResponse.json(reward)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ awarded: false }, { status: 200 })
    }

    return internalError(error, { route: "tokens:earn" }, "Failed to award FitTokens")
  }
}
