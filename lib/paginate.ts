import { Model, FilterQuery, Query, Document } from "mongoose";

import {
  normalizePagination,
  createPaginationResult,
  type PaginationParams,
  type PaginationResult,
} from "./pagination";

/**
 * Generic pagination function for Mongoose models.
 * Works with any Model and can accept a query filter.
 *
 * @param Model - Mongoose model to paginate
 * @param params - Pagination parameters (page, limit)
 * @param filter - Optional MongoDB filter query
 * @param queryModifier - Optional function to modify the query (e.g., populate, sort)
 * @returns Paginated result with data and metadata
 *
 * @example
 * // Basic usage
 * const result = await paginate(User, { page: 1, limit: 10 });
 *
 * @example
 * // With filter
 * const result = await paginate(User, { page: 1, limit: 10 }, { email: /@example.com/ });
 *
 * @example
 * // With query modifier (sort, populate, etc.)
 * const result = await paginate(
 *   User,
 *   { page: 1, limit: 10 },
 *   {},
 *   (query) => query.sort({ createdAt: -1 }).populate('relatedField')
 * );
 */
export async function paginate<TDocument>(
  Model: Model<any>,
  params?: PaginationParams,
  filter: FilterQuery<any> = {},
  queryModifier?: (query: Query<any[], any>) => Query<any[], any>
): Promise<PaginationResult<TDocument>> {
  const { page, limit, skip } = normalizePagination(params || {});

  // Build base query
  let query: Query<any[], any> = Model.find(filter).skip(skip).limit(limit);

  // Apply query modifier if provided (sort, populate, select, etc.)
  if (queryModifier) {
    query = queryModifier(query);
  }

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    query.lean<TDocument[]>(),
    Model.countDocuments(filter),
  ]);

  return createPaginationResult(data, total, page, limit);
}
