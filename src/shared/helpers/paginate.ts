import { PAGINATION } from "../constants/pagination";

/**
 * Normalizes page/limit query params into safe, bounded numbers.
 * Used by all paginated repository methods to avoid duplicating this logic.
 *
 * @param page    - raw page param from request (string or number)
 * @param limit   - raw limit param from request (string or number)
 * @param maxLimit     - upper bound for limit (default: PAGINATION.MAX_LIMIT)
 * @param defaultLimit - fallback limit if not supplied (default: PAGINATION.DEFAULT_LIMIT)
 */
export function normalizePagination(
  page?: number | string,
  limit?: number | string,
  maxLimit: number = PAGINATION.MAX_LIMIT,
  defaultLimit: number = PAGINATION.DEFAULT_LIMIT,
): { page: number; limit: number; skip: number } {
  const p = Math.max(1, Number(page) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(maxLimit, Math.max(1, Number(limit) || defaultLimit));
  return { page: p, limit: l, skip: (p - 1) * l };
}
