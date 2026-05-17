import { auth } from "@/lib/auth"
import { internalError, unauthorized } from "@/lib/apiResponse"
import { db } from "@/lib/db"
import { rateLimitByUser, rateLimitPresets } from "@/lib/security"
import { parseQuery, strictObject } from "@/lib/validation"
import { NextResponse } from "next/server"

function formatTransaction(transaction: {
  id: string
  amount: unknown
  reason: string
  createdAt: Date
  workoutLog: { workoutName: string } | null
}) {
  return {
    id: transaction.id,
    amount: Number(transaction.amount),
    reason: transaction.reason,
    createdAt: transaction.createdAt,
    workoutName: transaction.workoutLog?.workoutName || "Workout",
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return unauthorized()
    }
    const limited = rateLimitByUser(req, session.user.id, rateLimitPresets.read, "tokens:get")
    if (limited) return limited

    const parsedQuery = parseQuery(req, strictObject({}))
    if (parsedQuery.response) return parsedQuery.response

    const [balance, transactions] = await Promise.all([
      db.fitTokenBalance.findUnique({
        where: { userId: session.user.id },
      }),
      db.fitToken.findMany({
        where: { userId: session.user.id },
        include: {
          workoutLog: {
            select: { workoutName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    return NextResponse.json({
      balance: Number(balance?.amount || 0),
      transactions: transactions.map(formatTransaction),
    })
  } catch (error) {
    return internalError(error, { route: "tokens:get" }, "Failed to fetch FitTokens")
  }
}
