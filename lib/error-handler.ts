import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { Session } from "next-auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Creates a standardized error response from an ApiError or unknown error.
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: error.code || "API_ERROR",
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }

  // Zod validation errors → 400 with details
  if (error instanceof ZodError) {
    const details = error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details,
        },
      },
      { status: 400 }
    );
  }

  // Log unexpected errors in development
  if (process.env.NODE_ENV === "development") {
    console.error("Unexpected error:", error);
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
      },
    },
    { status: 500 }
  );
}

/**
 * Validates that a user session exists, throws ApiError if not.
 */
export function requireAuth(
  session: Session | null
): asserts session is Session {
  if (!session) {
    throw new ApiError(401, "Unauthorized", "AUTH_REQUIRED");
  }
}
