import mongoose, { ClientSession } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";

/**
 * Runs the provided async function within a MongoDB transaction using Mongoose sessions.
 * Ensures a DB connection first, starts a session, runs the work, then commits or aborts.
 *
 * @template T - Return type of the transactional function.
 * @param work - Async function that receives the session and returns a value.
 * @returns The value returned by the async work function.
 *
 * @example
 * const result = await runInTransaction(async (session) => {
 *   const created = await User.create([{ email: 'a@b.com' }], { session });
 *   await AuditLog.create([{ action: 'user_created', userId: created[0]._id }], { session });
 *   return created[0];
 * });
 */
export async function runInTransaction<T>(
  work: (session: ClientSession) => Promise<T>
): Promise<T> {
  await connectToDatabase();
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    // withTransaction already aborts on throw; rethrow for caller handling
    throw error;
  } finally {
    session.endSession();
  }
}
