import { getServerSession } from "next-auth";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth, handleApiError } from "@/lib/error-handler";
import { authOptions } from "@/lib/auth";

/**
 * Ensures a MongoDB/Mongoose connection is established before executing an async handler.
 *
 * Useful in App Router route handlers to avoid repeating `connectToDatabase()`
 * on every request. Wrap your handler and export the wrapped version.
 *
 * @template T - An async handler function type.
 * @param handler - The async function to run after the database connection is ready.
 * @returns The original handler wrapped to auto-connect to the database first.
 *
 * @example
 * export const GET = withDb(async () => {
 *   const users = await User.find({});
 *   return NextResponse.json({ ok: true, users });
 * });
 */
export function withDb<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    await connectToDatabase();
    return handler(...(args as Parameters<T>));
  }) as T;
}

/**
 * Same as withDb, but also enforces that the requester is authenticated.
 * Useful for private routes. Uses NextAuth's getServerSession + requireAuth.
 */
export function withPrivateDb<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      await connectToDatabase();
      const session = await getServerSession(authOptions);
      requireAuth(session);
      return await handler(...(args as Parameters<T>));
    } catch (error) {
      // Ensure private wrapper always returns a JSON error response
      return handleApiError(error) as unknown as ReturnType<T>;
    }
  }) as T;
}
