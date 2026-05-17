type AuthProvidersResponse = Record<string, unknown>

/**
 * Checks whether the Google auth provider is available from NextAuth.
 *
 * @returns True when the server exposes a Google provider.
 */
export async function isGoogleAuthAvailable() {
  const response = await fetch("/api/auth/providers")
  if (!response.ok) return false

  const providers = (await response.json()) as AuthProvidersResponse
  return Boolean(providers.google)
}
