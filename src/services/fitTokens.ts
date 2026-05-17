type TokenResponse = {
  balance?: number
}

/**
 * Reads the current user's FitToken balance from the API.
 *
 * @returns The numeric token balance, or zero when the request cannot be completed.
 */
export async function fetchFitTokenBalance() {
  try {
    const response = await fetch("/api/tokens", { cache: "no-store" })
    if (!response.ok) return 0

    const data = (await response.json()) as TokenResponse
    return Number(data.balance || 0)
  } catch {
    return 0
  }
}
