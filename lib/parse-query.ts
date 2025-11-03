import { z } from "zod";

import { ApiError } from "@/lib/error-handler";

/**
 * Parses and validates URL search params against a Zod schema.
 * Throws ApiError with validation details if validation fails.
 *
 * @param url - The URL object with search params
 * @param schema - Zod schema to validate against
 * @returns The parsed and validated query parameters
 * @throws ApiError if validation fails
 *
 * @example
 * const query = await parseQuery(request.url, paginationSchema);
 */
export function parseQuery<T extends z.ZodTypeAny>(
  url: string | URL,
  schema: T
): z.infer<T> {
  try {
    const urlObj = typeof url === "string" ? new URL(url) : url;
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Convert string numbers to numbers
    const parsed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      // Try to parse as number if it looks like one
      if (/^\d+$/.test(value)) {
        parsed[key] = parseInt(value, 10);
      } else {
        parsed[key] = value;
      }
    }

    const result = schema.safeParse(parsed);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw new ApiError(
        400,
        "Invalid query parameters",
        "VALIDATION_ERROR",
        errors
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, "Invalid URL or query parameters", "INVALID_QUERY");
  }
}
