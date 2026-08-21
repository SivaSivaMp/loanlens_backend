import { Response } from 'express'

/**
 * Standard API response format used everywhere in the project.
 * Success: { success: true, data: {...}, message: "..." }
 * List:    { success: true, data: { items: [...], total: N, page: N, limit: N } }
 * Error:   { success: false, error: { code: "...", message: "..." } }
 */

export function successResponse(
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200
): Response {
  return res.status(statusCode).json({ success: true, data, message })
}

export function listResponse(
  res: Response,
  items: unknown[],
  total: number,
  page = 1,
  limit = 20
): Response {
  return res.status(200).json({
    success: true,
    data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    message: 'Success',
  })
}
