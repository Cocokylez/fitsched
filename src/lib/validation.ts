import { z } from "zod"
import type { NextResponse } from "next/server"
import { cleanText, readJsonBody, requestBodyErrorResponse, safeError } from "@/lib/security"

export { z }

export const dateIdSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
export const idSchema = z.string().trim().min(1).max(100)

type ValidationResult<T> =
  | { data: T; response: null }
  | { data: null; response: NextResponse }

/**
 * Creates a strict object schema that rejects unknown fields.
 *
 * @param shape - Zod schema shape for allowed fields.
 * @returns A strict Zod object schema.
 */
export function strictObject<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).strict()
}

/**
 * Creates a schema for sanitized required text.
 *
 * @param maxLength - Maximum allowed text length.
 * @param minLength - Minimum required length after cleanup.
 * @returns A Zod schema that trims unsafe control characters.
 */
export function cleanStringSchema(maxLength: number, minLength = 0) {
  return z
    .string()
    .transform((value) => cleanText(value, maxLength))
    .refine((value) => value.length >= minLength)
}

/**
 * Creates a schema for sanitized optional text.
 *
 * @param maxLength - Maximum allowed text length.
 * @returns A Zod schema that returns a cleaned string or null.
 */
export function optionalCleanStringSchema(maxLength: number) {
  return z
    .string()
    .optional()
    .nullable()
    .transform((value) => cleanText(value, maxLength) || null)
}

/**
 * Parses and validates a JSON body against a strict schema.
 *
 * @param req - Incoming request with JSON content.
 * @param schema - Zod schema used for validation.
 * @param maxBytes - Maximum body size in bytes.
 * @returns Parsed data or a safe validation response.
 */
export async function parseJsonBody<T extends z.ZodType>(req: Request, schema: T, maxBytes = 32_000): Promise<ValidationResult<z.infer<T>>> {
  try {
    const body = await readJsonBody(req, maxBytes)
    const result = schema.safeParse(body)
    if (!result.success) {
      return { data: null, response: safeError("Invalid request") }
    }
    return { data: result.data as z.infer<T>, response: null }
  } catch (error) {
    return { data: null, response: requestBodyErrorResponse(error) || safeError("Invalid request") }
  }
}

/**
 * Parses URL search parameters against a strict schema.
 *
 * @param req - Incoming request containing a query string.
 * @param schema - Zod schema used for validation.
 * @returns Parsed query data or a safe validation response.
 */
export function parseQuery<T extends z.ZodType>(req: Request, schema: T): ValidationResult<z.infer<T>> {
  const params: Record<string, string> = {}
  const searchParams = new URL(req.url).searchParams

  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }

  const result = schema.safeParse(params)
  if (!result.success) {
    return { data: null, response: safeError("Invalid query") }
  }

  return { data: result.data as z.infer<T>, response: null }
}
